from datetime import UTC, date, datetime, timedelta, timezone
from urllib.parse import urlencode

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AppError
from app.modules.menu.models import MenuItem, MenuItemStatus
from app.modules.orders.models import CafeOrder, OrderItem, OrderStatus, PaymentMethod
from app.modules.orders.qr_generator import (
    build_vietqr_emvco_payload,
    generate_qr_png_data_url,
    normalize_transfer_content,
)
from app.modules.orders.schemas import CreateOrderInput, OrderPreviewInput
from app.modules.tables.models import CafeTable, TableStatus

VN_TZ = timezone(timedelta(hours=7), name="UTC+07:00")


def _merged_quantities(items) -> dict[int, int]:
    quantities: dict[int, int] = {}
    for item in items:
        quantities[item.menu_item_id] = quantities.get(item.menu_item_id, 0) + item.quantity
    return quantities


async def preview_order(session: AsyncSession, request: OrderPreviewInput) -> dict[str, object]:
    if not request.items or any(item.quantity <= 0 for item in request.items):
        raise AppError("EMPTY_ORDER_ITEMS", "Vui lòng chọn ít nhất một món", 422, "items")
    table = await session.scalar(
        select(CafeTable).where(
            CafeTable.ma_qr == request.qr_token,
            CafeTable.da_xoa.is_(False),
        )
    )
    if table is None:
        raise AppError("QR_INVALID", "Mã QR không hợp lệ", 404)
    quantities = _merged_quantities(request.items)
    items = (
        await session.execute(
            select(MenuItem).where(
                MenuItem.ma_mon.in_(quantities),
                MenuItem.da_xoa.is_(False),
                MenuItem.trang_thai == MenuItemStatus.VISIBLE,
            )
        )
    ).scalars().all()
    menu_by_id = {item.ma_mon: item for item in items}
    if len(menu_by_id) != len(quantities):
        raise AppError("ORDER_INVALID", "Đặt món không thành công, vui lòng thử lại!", 422)
    lines = [
        {
            "ma_mon": item_id,
            "ten_mon": menu_by_id[item_id].ten_mon,
            "gia": menu_by_id[item_id].gia_ban,
            "so_luong": quantity,
            "thanh_tien": menu_by_id[item_id].gia_ban * quantity,
        }
        for item_id, quantity in quantities.items()
    ]
    total = sum(line["thanh_tien"] for line in lines)
    qr_url = None
    message = (
        "Chờ thu tiền sau khi bưng nước ra"
        if request.payment_method == PaymentMethod.CASH
        else "Sau khi chuyển khoản, nhấn Hoàn tất. Vui lòng chụp lại giao dịch để đối chiếu khi cần thiết"
    )
    if request.payment_method == PaymentMethod.TRANSFER:
        settings = get_settings()
        bank_values = (settings.bank_bin, settings.bank_account_no, settings.bank_account_name)
        if not all(value and value.get_secret_value().strip() for value in bank_values):
            raise AppError("PAYMENT_NOT_CONFIGURED", "Thông tin chuyển khoản chưa được cấu hình", 503)
        bank_bin = settings.bank_bin.get_secret_value()
        account_no = settings.bank_account_no.get_secret_value()
        transfer_content = normalize_transfer_content(table.so_ban)
        payload = build_vietqr_emvco_payload(bank_bin, account_no, total, transfer_content)
        qr_url = generate_qr_png_data_url(payload)
    return {
        "ma_ban": table.ma_ban,
        "so_ban": table.so_ban,
        "items": lines,
        "total_amount": total,
        "payment_method": request.payment_method,
        "payment_qr_url": qr_url,
        "payment_message": message,
    }


async def create_order(session: AsyncSession, request: CreateOrderInput) -> CafeOrder:
    """Create an order and mark its table serving in one database transaction."""
    if not request.items or any(item.quantity <= 0 for item in request.items):
        raise AppError("EMPTY_ORDER_ITEMS", "Vui lòng chọn ít nhất một món", 422, "items")
    requested_quantities = _merged_quantities(request.items)

    async with session.begin():
        table = (
            await session.execute(
                select(CafeTable)
                .where(CafeTable.ma_qr == request.qr_token, CafeTable.da_xoa.is_(False))
                .with_for_update()
            )
        ).scalar_one_or_none()
        if table is None:
            raise AppError("QR_INVALID", "Mã QR không hợp lệ", 404)

        menu_items = (
            await session.execute(
                select(MenuItem).where(
                    MenuItem.ma_mon.in_(requested_quantities),
                    MenuItem.da_xoa.is_(False),
                    MenuItem.trang_thai == MenuItemStatus.VISIBLE,
                )
            )
        ).scalars().all()
        menu_by_id = {item.ma_mon: item for item in menu_items}
        if len(menu_by_id) != len(requested_quantities):
            raise AppError("ORDER_INVALID", "Đặt món không thành công, vui lòng thử lại!", 422)

        order = CafeOrder(
            ma_ban=table.ma_ban,
            phuong_thuc_thanh_toan=request.payment_method,
            trang_thai=OrderStatus.AWAITING_PAYMENT,
            ghi_chu=request.note.strip() if request.note and request.note.strip() else None,
        )
        order.chi_tiet = [
            OrderItem(
                ma_mon=menu_id,
                ten_mon=menu_by_id[menu_id].ten_mon,
                gia=menu_by_id[menu_id].gia_ban,
                so_luong=quantity,
            )
            for menu_id, quantity in requested_quantities.items()
        ]
        session.add(order)
        table.trang_thai = TableStatus.SERVING
        await session.flush()

    return order


def period_bounds(period: str, requested: str | None) -> tuple[datetime, datetime]:
    now = datetime.now(VN_TZ)
    if period == "day":
        selected = date.fromisoformat(requested) if requested else now.date()
        start = datetime.combine(selected, datetime.min.time(), tzinfo=VN_TZ)
        end = start + timedelta(days=1)
    elif period == "month":
        if requested:
            year, month = map(int, requested.split("-"))
            selected = date(year, month, 1)
        else:
            selected = date(now.year, now.month, 1)
        start = datetime.combine(selected, datetime.min.time(), tzinfo=VN_TZ)
        end = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
    else:
        year = int(requested) if requested else now.year
        start = datetime(year, 1, 1, tzinfo=VN_TZ)
        end = datetime(year + 1, 1, 1, tzinfo=VN_TZ)
    return start.astimezone(UTC), end.astimezone(UTC)


async def list_orders_for_day(session: AsyncSession, selected_date: date) -> list[dict[str, object]]:
    start = datetime.combine(selected_date, datetime.min.time(), tzinfo=VN_TZ).astimezone(UTC)
    end = start + timedelta(days=1)
    orders = (
        await session.execute(
            select(CafeOrder, CafeTable)
            .join(CafeTable, CafeTable.ma_ban == CafeOrder.ma_ban)
            .where(
                CafeOrder.da_xoa.is_(False),
                CafeOrder.thoi_gian_dat >= start,
                CafeOrder.thoi_gian_dat < end,
            )
            .order_by(CafeOrder.thoi_gian_dat.desc())
        )
    ).all()
    ids = [order.ma_don_hang for order, _ in orders]
    totals: dict[int, int] = {}
    if ids:
        rows = await session.execute(
            select(OrderItem.ma_don_hang, func.sum(OrderItem.gia * OrderItem.so_luong))
            .where(OrderItem.ma_don_hang.in_(ids))
            .group_by(OrderItem.ma_don_hang)
        )
        totals = {order_id: int(total or 0) for order_id, total in rows}
    return [
        {
            "ma_don_hang": order.ma_don_hang,
            "ma_don_hang_hien_thi": f"#{order.ma_don_hang:04d}",
            "ma_ban": table.ma_ban,
            "so_ban": table.so_ban,
            "thoi_gian_dat": order.thoi_gian_dat,
            "phuong_thuc_thanh_toan": order.phuong_thuc_thanh_toan.value,
            "trang_thai": order.trang_thai.value,
            "tong_tien": totals.get(order.ma_don_hang, 0),
        }
        for order, table in orders
    ]


async def get_order_detail(session: AsyncSession, order_id: int) -> dict[str, object]:
    result = await session.execute(
        select(CafeOrder, CafeTable)
        .join(CafeTable, CafeTable.ma_ban == CafeOrder.ma_ban)
        .where(CafeOrder.ma_don_hang == order_id, CafeOrder.da_xoa.is_(False))
    )
    pair = result.first()
    if pair is None:
        raise AppError("ORDER_NOT_FOUND", "Không tìm thấy đơn", 404)
    order, table = pair
    lines = (
        await session.execute(
            select(OrderItem).where(OrderItem.ma_don_hang == order_id).order_by(OrderItem.ma_mon)
        )
    ).scalars().all()
    detail = [
        {
            "ma_mon": line.ma_mon,
            "ten_mon": line.ten_mon,
            "gia": line.gia,
            "so_luong": line.so_luong,
            "thanh_tien": line.gia * line.so_luong,
        }
        for line in lines
    ]
    return {
        "ma_don_hang": order.ma_don_hang,
        "ma_don_hang_hien_thi": f"#{order.ma_don_hang:04d}",
        "ma_ban": table.ma_ban,
        "so_ban": table.so_ban,
        "thoi_gian_dat": order.thoi_gian_dat,
        "phuong_thuc_thanh_toan": order.phuong_thuc_thanh_toan.value,
        "ghi_chu": order.ghi_chu,
        "trang_thai": order.trang_thai.value,
        "tong_tien": sum(line["thanh_tien"] for line in detail),
        "chi_tiet": detail,
        "thoi_gian_giao_dich": order.thoi_gian_giao_dich,
    }


async def confirm_order_payment(session: AsyncSession, order_id: int) -> CafeOrder:
    order = await session.scalar(
        select(CafeOrder)
        .where(CafeOrder.ma_don_hang == order_id, CafeOrder.da_xoa.is_(False))
        .with_for_update()
    )
    if order is None:
        raise AppError("ORDER_NOT_FOUND", "Không tìm thấy đơn", 404)
    if order.trang_thai == OrderStatus.PAID:
        return order
    order.trang_thai = OrderStatus.PAID
    order.thoi_gian_giao_dich = datetime.now(UTC)
    await session.commit()
    await session.refresh(order)
    return order


async def soft_delete_order(session: AsyncSession, order_id: int) -> None:
    order = await session.scalar(
        select(CafeOrder)
        .where(CafeOrder.ma_don_hang == order_id, CafeOrder.da_xoa.is_(False))
        .with_for_update()
    )
    if order is None:
        raise AppError("ORDER_NOT_FOUND", "Không tìm thấy đơn", 404)
    order.da_xoa = True
    await session.commit()


async def get_unread_orders(session: AsyncSession, after_id: int | None) -> dict[str, object]:
    pending = select(CafeOrder).where(
        CafeOrder.da_xoa.is_(False), CafeOrder.trang_thai == OrderStatus.AWAITING_PAYMENT
    )
    unread_count = await session.scalar(select(func.count()).select_from(pending.subquery()))
    newest_id = await session.scalar(select(func.max(CafeOrder.ma_don_hang)).where(
        CafeOrder.da_xoa.is_(False), CafeOrder.trang_thai == OrderStatus.AWAITING_PAYMENT
    ))
    return {
        "unread_count": int(unread_count or 0),
        "has_new_order": bool(after_id is not None and newest_id is not None and newest_id > after_id),
        "latest_order_id": newest_id,
    }
