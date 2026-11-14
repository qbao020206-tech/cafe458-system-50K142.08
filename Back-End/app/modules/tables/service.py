import secrets
import string

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AppError
from app.modules.orders.models import CafeOrder, OrderStatus
from app.modules.tables.models import CafeTable, TableStatus

QR_ALPHABET = string.ascii_letters + string.digits


def _new_qr_token() -> str:
    return "".join(secrets.choice(QR_ALPHABET) for _ in range(16))


def customer_menu_url(qr_token: str) -> str:
    settings = get_settings()
    base_url = settings.primary_frontend_url.rstrip("/")
    return f"{base_url}/menu?qr={qr_token}"


async def list_tables(session: AsyncSession) -> list[CafeTable]:
    return list(
        (
            await session.execute(
                select(CafeTable)
                .where(CafeTable.da_xoa.is_(False))
                .order_by(CafeTable.so_ban.asc())
            )
        ).scalars().all()
    )


async def create_table(session: AsyncSession, owner_name: str, table_number: str) -> CafeTable:
    number = table_number.strip()
    if not number:
        raise AppError("VALIDATION_ERROR", "Không được để trống!", 422, "so_ban")
    duplicate = await session.scalar(
        select(CafeTable.ma_ban).where(
            CafeTable.da_xoa.is_(False), CafeTable.so_ban == number
        )
    )
    if duplicate is not None:
        raise AppError("TABLE_NUMBER_EXISTS", "Số bàn đã tồn tại!", 422, "so_ban")
    table = CafeTable(
        ten_dang_nhap=owner_name,
        so_ban=number,
        trang_thai=TableStatus.EMPTY,
        ma_qr=_new_qr_token(),
    )
    session.add(table)
    await session.commit()
    await session.refresh(table)
    return table


async def get_active_table(session: AsyncSession, table_id: int) -> CafeTable:
    table = await session.scalar(
        select(CafeTable).where(
            CafeTable.ma_ban == table_id, CafeTable.da_xoa.is_(False)
        )
    )
    if table is None:
        raise AppError("TABLE_NOT_FOUND", "Không tìm thấy bàn", 404)
    return table


async def delete_empty_table(session: AsyncSession, table_id: int) -> None:
    table = await session.scalar(
        select(CafeTable)
        .where(CafeTable.ma_ban == table_id, CafeTable.da_xoa.is_(False))
        .with_for_update()
    )
    if table is None:
        raise AppError("TABLE_NOT_FOUND", "Không tìm thấy bàn", 404)
    if table.trang_thai != TableStatus.EMPTY:
        raise AppError("TABLE_NOT_EMPTY", "Chỉ được xóa bàn ở trạng thái Trống", 400)
    pending_order = await session.scalar(
        select(CafeOrder.ma_don_hang).where(
            CafeOrder.ma_ban == table_id,
            CafeOrder.da_xoa.is_(False),
            CafeOrder.trang_thai == OrderStatus.AWAITING_PAYMENT,
        ).limit(1)
    )
    if pending_order is not None:
        raise AppError(
            "TABLE_HAS_UNRESOLVED_ORDERS",
            "Bàn còn đơn chưa xử lý. Vui lòng hủy hoặc xác nhận các đơn trước khi xóa bàn.",
            409,
        )
    table.da_xoa = True
    table.ma_qr = _new_qr_token()
    await session.commit()


async def mark_table_empty(session: AsyncSession, table_id: int) -> None:
    table = await session.scalar(
        select(CafeTable)
        .where(CafeTable.ma_ban == table_id, CafeTable.da_xoa.is_(False))
        .with_for_update()
    )
    if table is None:
        raise AppError("TABLE_NOT_FOUND", "Không tìm thấy bàn", 404)
    if table.trang_thai != TableStatus.SERVING:
        raise AppError("TABLE_NOT_SERVING", "Bàn không ở trạng thái Đang phục vụ", 400)

    unresolved_order = await session.scalar(
        select(CafeOrder.ma_don_hang).where(
            CafeOrder.ma_ban == table_id,
            CafeOrder.da_xoa.is_(False),
            CafeOrder.trang_thai == OrderStatus.AWAITING_PAYMENT,
        )
    )
    if unresolved_order is not None:
        raise AppError("TABLE_HAS_UNRESOLVED_ORDERS", "Có lỗi xảy ra, vui lòng thử lại!", 409)

    table.trang_thai = TableStatus.EMPTY
    await session.commit()
