import bcrypt
import jwt
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AppError
from app.infrastructure.database import get_session
from app.modules.auth.models import Owner
from app.modules.auth.schemas import AccessToken, AuthMessage, ChangePasswordInput, OwnerLoginInput
from app.modules.auth.security import (
    bearer_scheme,
    create_owner_token,
    require_owner,
    revoke_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=AccessToken)
async def owner_login(
    request: OwnerLoginInput,
    session: AsyncSession = Depends(get_session),
) -> AccessToken:
    owner = await session.scalar(
        select(Owner).where(Owner.ten_dang_nhap == request.username)
    )
    valid_password = False
    if owner is not None:
        try:
            valid_password = bcrypt.checkpw(
                request.password.encode("utf-8"), owner.mat_khau.encode("utf-8")
            )
        except ValueError:
            valid_password = False
    if not valid_password:
        raise AppError("LOGIN_FAILED", "Đăng nhập không thành công!", 401)
    return AccessToken(access_token=create_owner_token(request.username))


@router.post("/logout", response_model=AuthMessage)
async def owner_logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    _: str = Depends(require_owner),
) -> AuthMessage:
    if credentials is None:
        raise AppError("UNAUTHORIZED", "Token đăng nhập không hợp lệ hoặc đã hết hạn", 401)
    try:
        payload = jwt.decode(
            credentials.credentials,
            get_settings().jwt_secret.get_secret_value(),
            algorithms=[get_settings().jwt_algorithm],
        )
        await revoke_token(credentials.credentials, int(payload["exp"]))
    except (jwt.PyJWTError, KeyError, TypeError, ValueError) as error:
        raise AppError("UNAUTHORIZED", "Token đăng nhập không hợp lệ hoặc đã hết hạn", 401) from error
    return AuthMessage(message="Đã đăng xuất")


@router.put("/password", response_model=AuthMessage)
async def change_owner_password(
    request: ChangePasswordInput,
    username: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> AuthMessage:
    if not request.current_password or not request.current_password.strip():
        raise AppError("VALIDATION_ERROR", "Không được để trống!", 422, field="mat_khau_cu")
    if not request.new_password or not request.new_password.strip():
        raise AppError("VALIDATION_ERROR", "Không được để trống!", 422, field="mat_khau_moi")
    if not request.confirm_new_password or not request.confirm_new_password.strip():
        raise AppError("VALIDATION_ERROR", "Không được để trống!", 422, field="nhap_lai_mat_khau_moi")

    owner = await session.scalar(
        select(Owner).where(Owner.ten_dang_nhap == username).with_for_update()
    )
    if owner is None:
        raise AppError("UNAUTHORIZED", "Token đăng nhập không hợp lệ hoặc đã hết hạn", 401)
    try:
        valid_old_password = bcrypt.checkpw(
            request.current_password.encode("utf-8"), owner.mat_khau.encode("utf-8")
        )
    except ValueError:
        valid_old_password = False
    if not valid_old_password:
        raise AppError("INVALID_OLD_PASSWORD", "Mật khẩu cũ không đúng!", 400, field="mat_khau_cu")

    if request.new_password != request.confirm_new_password:
        raise AppError(
            "PASSWORD_MISMATCH",
            "Mật khẩu mới và mật khẩu nhập lại không giống nhau!",
            400,
            field="nhap_lai_mat_khau_moi",
        )

    owner.mat_khau = bcrypt.hashpw(
        request.new_password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")
    await session.commit()
    return AuthMessage(message="Đổi mật khẩu thành công!")
