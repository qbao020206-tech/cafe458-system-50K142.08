import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from tests.conftest import TestSessionFactory as SessionFactory
from app.modules.menu.models import MenuItem, MenuItemStatus
from app.modules.orders.models import CafeOrder
from app.modules.tables.models import CafeTable, TableStatus


@pytest.fixture
async def active_table_and_menu():
    unique_code = uuid.uuid4().hex[:6]
    table_num = f"C{unique_code[:4]}"
    dish_name = f"Trà vải {unique_code}"

    async with SessionFactory() as session:
        async with session.begin():
            table = CafeTable(
                ten_dang_nhap="admin",
                so_ban=table_num,
                trang_thai=TableStatus.EMPTY,
                ma_qr=f"qr_{unique_code}",
            )
            session.add(table)

            item = MenuItem(
                ten_mon=dish_name,
                gia_ban=28000,
                trang_thai=MenuItemStatus.VISIBLE,
            )
            session.add(item)
            await session.flush()
            t_id = table.ma_ban
            qr = table.ma_qr
            m_id = item.ma_mon

    yield {"table_id": t_id, "qr": qr, "menu_id": m_id}

    # Cleanup
    async with SessionFactory() as session:
        async with session.begin():
            t = await session.scalar(select(CafeTable).where(CafeTable.ma_ban == t_id))
            if t:
                t.da_xoa = True
            m = await session.scalar(select(MenuItem).where(MenuItem.ma_mon == m_id))
            if m:
                m.da_xoa = True


@pytest.mark.asyncio
async def test_customer_menu_with_qr_and_qr_token(client: AsyncClient, active_table_and_menu: dict):
    qr = active_table_and_menu["qr"]

    # Test with ?qr=...
    res1 = await client.get(f"/api/v1/customer/menu?qr={qr}")
    assert res1.status_code == 200
    b1 = res1.json()
    assert b1["ma_ban"] == active_table_and_menu["table_id"]
    assert len(b1["menu"]) > 0

    # Test with ?qr_token=...
    res2 = await client.get(f"/api/v1/customer/menu?qr_token={qr}")
    assert res2.status_code == 200
    assert res2.json()["ma_ban"] == active_table_and_menu["table_id"]

    # Test invalid QR
    res_inv = await client.get("/api/v1/customer/menu?qr=invalid_qr_token_xyz")
    assert res_inv.status_code == 404
    assert res_inv.json()["error"]["code"] == "QR_INVALID"
    assert res_inv.json()["error"]["message"] == "Mã QR không hợp lệ"


@pytest.mark.asyncio
async def test_preview_order_empty_items(client: AsyncClient, active_table_and_menu: dict):
    res = await client.post(
        "/api/v1/customer/orders/preview",
        json={
            "qr": active_table_and_menu["qr"],
            "items": [],
            "phuong_thuc_thanh_toan": "Tiền mặt",
        },
    )
    assert res.status_code == 422
    assert res.json()["error"]["message"] == "Vui lòng chọn ít nhất một món"


@pytest.mark.asyncio
async def test_preview_order_payment_messages(client: AsyncClient, active_table_and_menu: dict):
    qr = active_table_and_menu["qr"]
    m_id = active_table_and_menu["menu_id"]

    # 1. Cash message
    res_cash = await client.post(
        "/api/v1/customer/orders/preview",
        json={
            "qr": qr,
            "items": [{"ma_mon": m_id, "so_luong": 1}],
            "phuong_thuc_thanh_toan": "Tiền mặt",
        },
    )
    assert res_cash.status_code == 200
    assert res_cash.json()["payment_message"] == "Chờ thu tiền sau khi bưng nước ra"

    # 2. Transfer message
    res_transfer = await client.post(
        "/api/v1/customer/orders/preview",
        json={
            "qr": qr,
            "items": [{"ma_mon": m_id, "so_luong": 1}],
            "phuong_thuc_thanh_toan": "Chuyển khoản",
        },
    )
    # May be 200 or 503 if bank not configured in test environment
    if res_transfer.status_code == 200:
        data = res_transfer.json()
        assert (
            data["payment_message"]
            == "Sau khi chuyển khoản, nhấn Hoàn tất. Vui lòng chụp lại giao dịch để đối chiếu khi cần thiết"
        )
        assert data["payment_qr_url"] is not None
        assert data["payment_qr_url"].startswith("data:image/png;base64,")


@pytest.mark.asyncio
async def test_create_order_lifecycle(client: AsyncClient, active_table_and_menu: dict):
    qr = active_table_and_menu["qr"]
    m_id = active_table_and_menu["menu_id"]
    t_id = active_table_and_menu["table_id"]

    res = await client.post(
        "/api/v1/customer/orders",
        json={
            "qr": qr,
            "items": [{"ma_mon": m_id, "so_luong": 2}],
            "phuong_thuc_thanh_toan": "Tiền mặt",
            "ghi_chu": "Ít ngọt",
        },
    )
    assert res.status_code == 201
    body = res.json()
    assert body["message"] == "Đặt món thành công"
    assert "order_id" in body
    assert body["total_amount"] == 28000 * 2
    assert "transfer_confirmation_deadline" not in body  # Must NOT be present
    order_id = body["order_id"]

    # Verify table transitioned to 'Đang phục vụ'
    async with SessionFactory() as session:
        t = await session.scalar(select(CafeTable).where(CafeTable.ma_ban == t_id))
        assert t.trang_thai == TableStatus.SERVING

    # Clean up order
    async with SessionFactory() as session:
        async with session.begin():
            o = await session.scalar(select(CafeOrder).where(CafeOrder.ma_don_hang == order_id))
            if o:
                o.da_xoa = True
