from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from tests.conftest import TestSessionFactory as SessionFactory
from app.modules.menu.models import MenuItem, MenuItemStatus
from app.modules.orders.models import CafeOrder, OrderItem, OrderStatus, PaymentMethod
from app.modules.tables.models import CafeTable, TableStatus


@pytest.fixture
async def sales_test_data():
    unique = uuid.uuid4().hex[:6]
    now = datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))

    async with SessionFactory() as session:
        async with session.begin():
            table = CafeTable(
                ten_dang_nhap="admin",
                so_ban=f"S{unique[:4]}",
                trang_thai=TableStatus.SERVING,
                ma_qr=f"qr_sales_{unique}",
            )
            session.add(table)

            item1 = MenuItem(ten_mon=f"Món A {unique}", gia_ban=10000, trang_thai=MenuItemStatus.VISIBLE)
            item2 = MenuItem(ten_mon=f"Món B {unique}", gia_ban=20000, trang_thai=MenuItemStatus.VISIBLE)
            session.add_all([item1, item2])
            await session.flush()

            # Paid order 1: 5 cups of Item 1, Cash
            order1 = CafeOrder(
                ma_ban=table.ma_ban,
                phuong_thuc_thanh_toan=PaymentMethod.CASH,
                trang_thai=OrderStatus.PAID,
                thoi_gian_dat=now - timedelta(minutes=10),
                thoi_gian_giao_dich=now - timedelta(minutes=9),
            )
            order1.chi_tiet = [
                OrderItem(ma_mon=item1.ma_mon, ten_mon=item1.ten_mon, gia=10000, so_luong=5)
            ]

            # Paid order 2: 5 cups of Item 2 (Tied for top!), Transfer
            order2 = CafeOrder(
                ma_ban=table.ma_ban,
                phuong_thuc_thanh_toan=PaymentMethod.TRANSFER,
                trang_thai=OrderStatus.PAID,
                thoi_gian_dat=now - timedelta(minutes=8),
                thoi_gian_giao_dich=now - timedelta(minutes=7),
            )
            order2.chi_tiet = [
                OrderItem(ma_mon=item2.ma_mon, ten_mon=item2.ten_mon, gia=20000, so_luong=5)
            ]

            session.add_all([order1, order2])
            await session.flush()
            t_id = table.ma_ban
            m1_id = item1.ma_mon
            m2_id = item2.ma_mon
            o1_id = order1.ma_don_hang
            o2_id = order2.ma_don_hang

    yield {
        "table_id": t_id,
        "m1_id": m1_id,
        "m2_id": m2_id,
        "o1_id": o1_id,
        "o2_id": o2_id,
        "today_str": now.strftime("%Y-%m-%d"),
    }

    # Cleanup
    async with SessionFactory() as session:
        async with session.begin():
            for o_id in (o1_id, o2_id):
                o = await session.scalar(select(CafeOrder).where(CafeOrder.ma_don_hang == o_id))
                if o:
                    o.da_xoa = True
            for m_id in (m1_id, m2_id):
                m = await session.scalar(select(MenuItem).where(MenuItem.ma_mon == m_id))
                if m:
                    m.da_xoa = True
            t = await session.scalar(select(CafeTable).where(CafeTable.ma_ban == t_id))
            if t:
                t.da_xoa = True


@pytest.mark.asyncio
async def test_revenue_report(client: AsyncClient, admin_headers: dict, sales_test_data: dict):
    res = await client.get("/api/v1/admin/reports/revenue?period=day", headers=admin_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["period"] == "day"
    assert isinstance(body["items"], list)


@pytest.mark.asyncio
async def test_report_details_and_tied_best_seller(client: AsyncClient, admin_headers: dict, sales_test_data: dict):
    today = sales_test_data["today_str"]
    res = await client.get(
        f"/api/v1/admin/reports/details?period=day&date={today}",
        headers=admin_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["period"] == "day"

    # Payment method breakdown
    pttt = body["doanh_thu_theo_phuong_thuc"]
    assert "tien_mat" in pttt
    assert "chuyen_khoan" in pttt
    assert pttt["tong"] == pttt["tien_mat"] + pttt["chuyen_khoan"]

    # Sales statistics
    thong_ke = body["thong_ke_ban_hang"]
    assert thong_ke["tong_so_ly"] >= 10
    cac_mon = {m["ma_mon"]: m for m in thong_ke["cac_mon"]}

    # BR-UC5-09: Both Item 1 and Item 2 sold 5 cups and are tied for top seller
    m1 = cac_mon.get(sales_test_data["m1_id"])
    m2 = cac_mon.get(sales_test_data["m2_id"])
    assert m1 is not None and m2 is not None
    assert m1["so_luong"] == 5
    assert m2["so_luong"] == 5
    assert m1["ban_chay_nhat"] is True
    assert m2["ban_chay_nhat"] is True
    assert m1["ten_mon"] in thong_ke["mon_ban_chay_nhat"]
    assert m2["ten_mon"] in thong_ke["mon_ban_chay_nhat"]
