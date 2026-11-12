from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.security import require_owner
from app.infrastructure.database import get_session
from app.modules.orders.schemas import (
    CreateOrderInput,
    CreatedOrder,
    OrderMessage,
    OrderPreviewInput,
    OrderPreviewOutput,
)
from app.modules.orders.service import (
    confirm_order_payment,
    create_order,
    get_order_detail,
    get_unread_orders,
    list_orders_for_day,
    preview_order,
    soft_delete_order,
)

router = APIRouter(prefix="/orders", tags=["orders"])
customer_router = APIRouter(prefix="/customer", tags=["customer"])
admin_router = APIRouter(prefix="/admin", tags=["orders"])
VN_TZ = timezone(timedelta(hours=7), name="UTC+07:00")


@router.post("", response_model=CreatedOrder, status_code=status.HTTP_201_CREATED)
@customer_router.post("/orders", response_model=CreatedOrder, status_code=status.HTTP_201_CREATED)
async def create_customer_order(
    request: CreateOrderInput,
    session: AsyncSession = Depends(get_session),
) -> CreatedOrder:
    order = await create_order(session, request)
    total = sum(line.gia * line.so_luong for line in order.chi_tiet)
    return CreatedOrder(
        message="Đặt món thành công",
        order_id=order.ma_don_hang,
        total_amount=total,
        payment_method=order.phuong_thuc_thanh_toan,
        status=order.trang_thai.value,
        placed_at=order.thoi_gian_dat,
    )


@customer_router.post("/orders/preview", response_model=OrderPreviewOutput)
async def preview_customer_order(
    request: OrderPreviewInput,
    session: AsyncSession = Depends(get_session),
) -> OrderPreviewOutput:
    return OrderPreviewOutput(**(await preview_order(session, request)))


@admin_router.get("/orders")
async def read_orders(
    order_date: date | None = Query(default=None, alias="date"),
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> list[dict[str, object]]:
    selected_date = order_date or datetime.now(VN_TZ).date()
    return await list_orders_for_day(session, selected_date)


@admin_router.get("/orders/{order_id}")
async def read_order_detail(
    order_id: int,
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> dict[str, object]:
    return await get_order_detail(session, order_id)


@admin_router.patch("/orders/{order_id}/confirm-payment", response_model=OrderMessage)
async def confirm_payment(
    order_id: int,
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> OrderMessage:
    await confirm_order_payment(session, order_id)
    return OrderMessage(message="Xác nhận đã nhận tiền!")


@admin_router.delete("/orders/{order_id}", response_model=OrderMessage)
async def delete_order(
    order_id: int,
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> OrderMessage:
    await soft_delete_order(session, order_id)
    return OrderMessage(message="Đã xóa đơn")


@admin_router.get("/notifications/unread-orders")
async def unread_orders(
    after_id: int | None = Query(default=None, ge=0),
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> dict[str, object]:
    return await get_unread_orders(session, after_id)
