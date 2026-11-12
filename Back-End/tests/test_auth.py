import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_missing_fields_validation_error(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={})
    assert response.status_code == 422
    body = response.json()
    assert "error" in body
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["error"]["message"] == "Không được để trống!"
    assert body["error"]["field"] in ["ten_dang_nhap", "mat_khau"]


@pytest.mark.asyncio
async def test_login_wrong_credentials(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"ten_dang_nhap": "admin", "mat_khau": "WrongPass@123"},
    )
    assert response.status_code == 401
    body = response.json()
    assert body == {
        "error": {
            "code": "LOGIN_FAILED",
            "message": "Đăng nhập không thành công!",
            "field": None,
        }
    }


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"ten_dang_nhap": "admin", "mat_khau": "Admin@123456"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_change_password_missing_fields(client: AsyncClient, admin_headers: dict):
    response = await client.put(
        "/api/v1/auth/password",
        json={"mat_khau_cu": "", "mat_khau_moi": "", "nhap_lai_mat_khau_moi": ""},
        headers=admin_headers,
    )
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["error"]["message"] == "Không được để trống!"


@pytest.mark.asyncio
async def test_change_password_wrong_old_password(client: AsyncClient, admin_headers: dict):
    response = await client.put(
        "/api/v1/auth/password",
        json={
            "mat_khau_cu": "WrongOldPass",
            "mat_khau_moi": "NewPass@123456",
            "nhap_lai_mat_khau_moi": "NewPass@123456",
        },
        headers=admin_headers,
    )
    assert response.status_code == 400
    body = response.json()
    assert body == {
        "error": {
            "code": "INVALID_OLD_PASSWORD",
            "message": "Mật khẩu cũ không đúng!",
            "field": "mat_khau_cu",
        }
    }


@pytest.mark.asyncio
async def test_change_password_mismatch(client: AsyncClient, admin_headers: dict):
    response = await client.put(
        "/api/v1/auth/password",
        json={
            "mat_khau_cu": "Admin@123456",
            "mat_khau_moi": "NewPass@123456",
            "nhap_lai_mat_khau_moi": "DifferentPass@123456",
        },
        headers=admin_headers,
    )
    assert response.status_code == 400
    body = response.json()
    assert body == {
        "error": {
            "code": "PASSWORD_MISMATCH",
            "message": "Mật khẩu mới và mật khẩu nhập lại không giống nhau!",
            "field": "nhap_lai_mat_khau_moi",
        }
    }


@pytest.mark.asyncio
async def test_change_password_success_and_revert(client: AsyncClient, admin_headers: dict):
    # Change to temporary password
    response = await client.put(
        "/api/v1/auth/password",
        json={
            "mat_khau_cu": "Admin@123456",
            "mat_khau_moi": "Admin@654321",
            "nhap_lai_mat_khau_moi": "Admin@654321",
        },
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Đổi mật khẩu thành công!"}

    # Revert back to Admin@123456
    revert_res = await client.put(
        "/api/v1/auth/password",
        json={
            "mat_khau_cu": "Admin@654321",
            "mat_khau_moi": "Admin@123456",
            "nhap_lai_mat_khau_moi": "Admin@123456",
        },
        headers=admin_headers,
    )
    assert revert_res.status_code == 200
    assert revert_res.json() == {"message": "Đổi mật khẩu thành công!"}


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, admin_headers: dict):
    response = await client.post("/api/v1/auth/logout", headers=admin_headers)
    assert response.status_code == 200
    assert response.json() == {"message": "Đã đăng xuất"}
