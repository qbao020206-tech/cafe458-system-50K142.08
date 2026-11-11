from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.modules.orders.models import CafeOrder, OrderItem, OrderStatus, PaymentMethod
from app.modules.orders.service import period_bounds

VN_TZ = timezone(timedelta(hours=7), name="UTC+07:00")
VALID_PERIODS = {"day", "month", "year"}


def validate_period_value(period: str, value: str | None) -> None:
    if period not in VALID_PERIODS:
        raise AppError("INVALID_PERIOD", "period phải là day, month hoặc year", 422, "period")
    if not value:
        return
    try:
        if period == "day":
            datetime.strptime(value, "%Y-%m-%d")
        elif period == "month":
            datetime.strptime(value, "%Y-%m")
        else:
            if len(value) != 4:
                raise ValueError
            datetime.strptime(value, "%Y")
    except ValueError as error:
        pattern = {"day": "YYYY-MM-DD", "month": "YYYY-MM", "year": "YYYY"}[period]
        raise AppError("INVALID_DATE", f"date phải có định dạng {pattern}", 422, "date") from error


async def revenue_by_period(
    session: AsyncSession, period: str, requested_date: str | None
) -> dict[str, object]:
    validate_period_value(period, requested_date)
    item_totals = (
        select(
            OrderItem.ma_don_hang.label("ma_don_hang"),
            func.sum(OrderItem.gia * OrderItem.so_luong).label("tong_tien"),
        )
        .group_by(OrderItem.ma_don_hang)
        .subquery()
    )
    bucket = func.date_trunc(
        period, func.timezone("Asia/Ho_Chi_Minh", CafeOrder.thoi_gian_giao_dich)
    ).label("ky")
    query = (
        select(bucket, func.sum(item_totals.c.tong_tien).label("doanh_thu"))
        .join(item_totals, item_totals.c.ma_don_hang == CafeOrder.ma_don_hang)
        .where(
            CafeOrder.da_xoa.is_(False),
            CafeOrder.trang_thai == OrderStatus.PAID,
        )
        .group_by(bucket)
        .order_by(bucket.desc())
    )
    rows = (await session.execute(query)).all()
    items = [
        {"ky": key.isoformat(), "doanh_thu": int(amount or 0)}
        for key, amount in rows
    ]
    return {"period": period, "items": items}


async def report_details(
    session: AsyncSession, period: str, requested_date: str | None
) -> dict[str, object]:
    validate_period_value(period, requested_date)
    start, end = period_bounds(period, requested_date)
    result = await session.execute(
        select(OrderItem, CafeOrder)
        .join(CafeOrder, CafeOrder.ma_don_hang == OrderItem.ma_don_hang)
        .where(
            CafeOrder.da_xoa.is_(False),
            CafeOrder.trang_thai == OrderStatus.PAID,
            CafeOrder.thoi_gian_giao_dich >= start,
            CafeOrder.thoi_gian_giao_dich < end,
        )
        .order_by(CafeOrder.thoi_gian_giao_dich.desc())
    )
    rows = result.all()
    method_totals = {PaymentMethod.CASH.value: 0, PaymentMethod.TRANSFER.value: 0}
    by_menu: dict[int, dict[str, object]] = {}
    for line, order in rows:
        amount = line.gia * line.so_luong
        method_totals[order.phuong_thuc_thanh_toan.value] += amount
        summary = by_menu.setdefault(
            line.ma_mon,
            {"ma_mon": line.ma_mon, "ten_mon": line.ten_mon, "so_luong": 0, "doanh_thu": 0},
        )
        # Rows are newest first; the first encountered snapshot is the latest recorded name.
        summary["so_luong"] = int(summary["so_luong"]) + line.so_luong
        summary["doanh_thu"] = int(summary["doanh_thu"]) + amount
    sales = sorted(by_menu.values(), key=lambda item: (-int(item["so_luong"]), int(item["ma_mon"])))
    best_quantity = max((int(item["so_luong"]) for item in sales), default=0)
    for item in sales:
        item["ban_chay_nhat"] = best_quantity > 0 and int(item["so_luong"]) == best_quantity
    return {
        "period": period,
        "date": requested_date,
        "doanh_thu_theo_phuong_thuc": {
            "tien_mat": method_totals[PaymentMethod.CASH.value],
            "chuyen_khoan": method_totals[PaymentMethod.TRANSFER.value],
            "tong": sum(method_totals.values()),
        },
        "thong_ke_ban_hang": {
            "tong_so_ly": sum(int(item["so_luong"]) for item in sales),
            "mon_ban_chay_nhat": [
                item["ten_mon"] for item in sales if item["ban_chay_nhat"]
            ],
            "cac_mon": sales,
        },
    }
