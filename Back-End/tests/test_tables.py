import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from tests.conftest import TestSessionFactory as SessionFactory
from app.modules.orders.models import CafeOrder, OrderItem, OrderStatus, PaymentMethod
from app.modules.tables.models import CafeTable, TableStatus


@pytest.mark.asyncio
async def test_add_table_validation(client: AsyncClient, admin_headers: dict):
    # Empty so_ban
    response = await client.post(
        "/api/v1/admin/tables",
        json={"so_ban": "   "},
        headers=admin_headers,
    )
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["error"]["message"] == "Không được để trống!"
    assert body["error"]["field"] == "so_ban"


@pytest.mark.asyncio
async def test_add_table_success_and_duplicate(client: AsyncClient, admin_headers: dict):
    unique_table_num = f"T{uuid.uuid4().hex[:4]}"

    # Add table successfully
    response = await client.post(
        "/api/v1/admin/tables",
        json={"so_ban": unique_table_num},
        headers=admin_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["message"] == "Thêm bàn thành công"
    assert body["so_ban"] == unique_table_num
    assert body["trang_thai"] == "Trống"
    table_id = body["ma_ban"]

    # Duplicate table
    dup_res = await client.post(
        "/api/v1/admin/tables",
        json={"so_ban": unique_table_num},
        headers=admin_headers,
    )
    assert dup_res.status_code == 422
    dup_body = dup_res.json()
    assert dup_body["error"]["code"] == "TABLE_NUMBER_EXISTS"
    assert dup_body["error"]["message"] == "Số bàn đã tồn tại!"

    # Clean up table
    del_res = await client.delete(f"/api/v1/admin/tables/{table_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Xóa bàn thành công"


@pytest.mark.asyncio
async def test_mark_table_empty_with_unpaid_order_blocked_then_success(client: AsyncClient, admin_headers: dict):
    """UC_4.4:
    - When table is 'Đang phục vụ' and still has unpaid order:
      PATCH /admin/tables/{id}/empty must return 409 with message 'Có lỗi xảy ra, vui lòng thử lại!'
      and table remains 'Đang phục vụ'.
    - After order is confirmed (or deleted):
      PATCH /admin/tables/{id}/empty returns 200 with message 'Đã đưa bàn về trạng thái Trống'
      and table becomes 'Trống'.
    """
    unique_num = f"E{uuid.uuid4().hex[:4]}"

    # 1. Create table
    create_res = await client.post(
        "/api/v1/admin/tables",
        json={"so_ban": unique_num},
        headers=admin_headers,
    )
    assert create_res.status_code == 201
    table_id = create_res.json()["ma_ban"]

    # 2. Directly set table to 'Đang phục vụ' and insert an unpaid order
    async with SessionFactory() as session:
        async with session.begin():
            table = await session.scalar(select(CafeTable).where(CafeTable.ma_ban == table_id))
            assert table is not None
            table.trang_thai = TableStatus.SERVING

            order = CafeOrder(
                ma_ban=table_id,
                phuong_thuc_thanh_toan=PaymentMethod.CASH,
                trang_thai=OrderStatus.AWAITING_PAYMENT,
            )
            session.add(order)
            await session.flush()
            order_id = order.ma_don_hang

    # 3. Call PATCH /admin/tables/{id}/empty - MUST BE BLOCKED (409)
    blocked_res = await client.patch(
        f"/api/v1/admin/tables/{table_id}/empty",
        headers=admin_headers,
    )
    assert blocked_res.status_code == 409
    blocked_body = blocked_res.json()
    assert blocked_body["error"]["code"] == "TABLE_HAS_UNRESOLVED_ORDERS"
    assert blocked_body["error"]["message"] == "Có lỗi xảy ra, vui lòng thử lại!"
    assert blocked_body["error"]["field"] is None

    # Verify table remains 'Đang phục vụ'
    async with SessionFactory() as session:
        t = await session.scalar(select(CafeTable).where(CafeTable.ma_ban == table_id))
        assert t.trang_thai == TableStatus.SERVING

    # 4. Confirm payment for the order
    confirm_res = await client.patch(
        f"/api/v1/admin/orders/{order_id}/confirm-payment",
        headers=admin_headers,
    )
    assert confirm_res.status_code == 200

    # 5. Call PATCH /admin/tables/{id}/empty - MUST SUCCEED (200)
    empty_res = await client.patch(
        f"/api/v1/admin/tables/{table_id}/empty",
        headers=admin_headers,
    )
    assert empty_res.status_code == 200
    body = empty_res.json()
    assert body == {"message": "Đã đưa bàn về trạng thái Trống"}

    # 6. Verify in DB table is now 'Trống'
    async with SessionFactory() as session:
        t = await session.scalar(select(CafeTable).where(CafeTable.ma_ban == table_id))
        assert t.trang_thai == TableStatus.EMPTY

    # 7. Clean up created order and table
    async with SessionFactory() as session:
        async with session.begin():
            ord_obj = await session.scalar(select(CafeOrder).where(CafeOrder.ma_don_hang == order_id))
            if ord_obj:
                ord_obj.da_xoa = True
            tab_obj = await session.scalar(select(CafeTable).where(CafeTable.ma_ban == table_id))
            if tab_obj:
                tab_obj.da_xoa = True
