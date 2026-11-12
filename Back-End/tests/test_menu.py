import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_add_menu_item_validation(client: AsyncClient, admin_headers: dict):
    # Empty ten_mon
    res1 = await client.post(
        "/api/v1/admin/menu",
        json={"ten_mon": "   ", "gia_ban": 25000},
        headers=admin_headers,
    )
    assert res1.status_code == 422
    b1 = res1.json()
    assert b1["error"]["code"] == "VALIDATION_ERROR"
    assert b1["error"]["message"] == "Không được để trống!"
    assert b1["error"]["field"] == "ten_mon"

    # Price <= 0
    res2 = await client.post(
        "/api/v1/admin/menu",
        json={"ten_mon": "Trà đào", "gia_ban": 0},
        headers=admin_headers,
    )
    assert res2.status_code == 422
    b2 = res2.json()
    assert b2["error"]["code"] == "VALIDATION_ERROR"
    assert b2["error"]["message"] == "Giá bán phải là số lớn hơn 0!"
    assert b2["error"]["field"] == "gia_ban"


@pytest.mark.asyncio
async def test_menu_crud_lifecycle(client: AsyncClient, admin_headers: dict):
    unique_name = f"Món test {uuid.uuid4().hex[:6]}"

    # 1. Create menu item
    res = await client.post(
        "/api/v1/admin/menu",
        json={"ten_mon": unique_name, "gia_ban": 30000},
        headers=admin_headers,
    )
    assert res.status_code == 201
    body = res.json()
    assert body["message"] == "Thêm món thành công"
    assert body["ten_mon"] == unique_name
    assert body["gia_ban"] == 30000
    item_id = body["ma_mon"]

    # 2. Add duplicate name (case-insensitive)
    dup_res = await client.post(
        "/api/v1/admin/menu",
        json={"ten_mon": unique_name.upper(), "gia_ban": 35000},
        headers=admin_headers,
    )
    assert dup_res.status_code == 422
    assert dup_res.json()["error"]["code"] == "MENU_NAME_EXISTS"
    assert dup_res.json()["error"]["message"] == "Tên món đã tồn tại!"

    # 3. Update menu item
    upd_res = await client.put(
        f"/api/v1/admin/menu/{item_id}",
        json={"gia_ban": 35000},
        headers=admin_headers,
    )
    assert upd_res.status_code == 200
    upd_body = upd_res.json()
    assert upd_body["message"] == "Cập nhật món thành công"
    assert upd_body["item"]["gia_ban"] == 35000

    # 4. Check list admin menu is sorted ma_mon DESC (QĐ-19)
    list_res = await client.get("/api/v1/admin/menu", headers=admin_headers)
    assert list_res.status_code == 200
    items = list_res.json()
    ids = [i["ma_mon"] for i in items]
    assert ids == sorted(ids, reverse=True)

    # 5. Delete menu item
    del_res = await client.delete(f"/api/v1/admin/menu/{item_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Đã xóa món thành công"
