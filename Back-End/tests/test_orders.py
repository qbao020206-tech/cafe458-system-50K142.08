import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from tests.conftest import TestSessionFactory as SessionFactory
from app.modules.menu.models import MenuItem, MenuItemStatus
from app.modules.orders.models import CafeOrder, OrderItem, OrderStatus, PaymentMethod
from app.modules.tables.models import CafeTable, TableStatus


@pytest.fixture
async def order_setup():
    unique = uuid.uuid4().hex[:6]
    async with SessionFactory() as session:
        async with session.begin():
            table = CafeTable(
                ten_dang_nhap="admin",
                so_ban=f"O{unique[:4]}",
                trang_thai=TableStatus.SERVING,
                ma_qr=f"qr_ord_{unique}",
            )
            session.add(table)

            item = MenuItem(
                ten_mon=f"Cà phê {unique}",
                gia_ban=20000,
                trang_thai=MenuItemStatus.VISIBLE,
            )
            session.add(item)
            await session.flush()

            order = CafeOrder(
                ma_ban=table.ma_ban,
                phuong_thuc_thanh_toan=PaymentMethod.CASH,
                trang_thai=OrderStatus.AWAITING_PAYMENT,
            )
            order.chi_tiet = [
                OrderItem(
                    ma_mon=item.ma_mon,
                    ten_mon=item.ten_mon,
                    gia=item.gia_ban,
                    so_luong=1,
                )
            ]
            session.add(order)
            await session.flush()
            t_id = table.ma_ban
            m_id = item.ma_mon
            o_id = order.ma_don_hang

    yield {"table_id": t_id, "menu_id": m_id, "order_id": o_id}

    # Cleanup
    async with SessionFactory() as session:
        async with session.begin():
            o = await session.scalar(select(CafeOrder).where(CafeOrder.ma_don_hang == o_id))
            if o:
                o.da_xoa = True
            t = await session.scalar(select(CafeTable).where(CafeTable.ma_ban == t_id))
            if t:
                t.da_xoa = True
            m = await session.scalar(select(MenuItem).where(MenuItem.ma_mon == m_id))
            if m:
                m.da_xoa = True


@pytest.mark.asyncio
async def test_confirm_payment_message(client: AsyncClient, admin_headers: dict, order_setup: dict):
    o_id = order_setup["order_id"]
    res = await client.patch(
        f"/api/v1/admin/orders/{o_id}/confirm-payment",
        headers=admin_headers,
    )
    assert res.status_code == 200
    assert res.json() == {"message": "Xác nhận đã nhận tiền!"}


@pytest.mark.asyncio
async def test_soft_delete_unpaid_order(client: AsyncClient, admin_headers: dict, order_setup: dict):
    o_id = order_setup["order_id"]
    t_id = order_setup["table_id"]

    res = await client.delete(f"/api/v1/admin/orders/{o_id}", headers=admin_headers)
    assert res.status_code == 200
    assert res.json() == {"message": "Đã xóa đơn"}

    # BR-UC2-09: Table status must not be changed
    async with SessionFactory() as session:
        t = await session.scalar(select(CafeTable).where(CafeTable.ma_ban == t_id))
        assert t.trang_thai == TableStatus.SERVING


@pytest.mark.asyncio
async def test_soft_delete_paid_order_allowed(client: AsyncClient, admin_headers: dict, order_setup: dict):
    """UC_2.3: Must allow soft-deleting paid orders without throwing 409."""
    o_id = order_setup["order_id"]

    # First confirm payment
    confirm_res = await client.patch(
        f"/api/v1/admin/orders/{o_id}/confirm-payment",
        headers=admin_headers,
    )
    assert confirm_res.status_code == 200

    # Then soft-delete the PAID order
    del_res = await client.delete(f"/api/v1/admin/orders/{o_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert del_res.json() == {"message": "Đã xóa đơn"}

    # Verify da_xoa is True
    async with SessionFactory() as session:
        o = await session.scalar(select(CafeOrder).where(CafeOrder.ma_don_hang == o_id))
        assert o.da_xoa is True
