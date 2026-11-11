import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Đăng nhập không thành công!",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return AccessToken(access_token=create_owner_token(request.username))


@router.post("/logout", response_model=AuthMessage)
async def owner_logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    _: str = Depends(require_owner),
) -> AuthMessage:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        payload = jwt.decode(
            credentials.credentials,
            get_settings().jwt_secret.get_secret_value(),
            algorithms=[get_settings().jwt_algorithm],
        )
        await revoke_token(credentials.credentials, int(payload["exp"]))
    except (jwt.PyJWTError, KeyError, TypeError, ValueError) as error:
        raise HTTPException(status_code=401, detail="Unauthorized") from error
    return AuthMessage(message="Đã đăng xuất")


@router.put("/password", response_model=AuthMessage)
async def change_owner_password(
    request: ChangePasswordInput,
    username: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> AuthMessage:
    if request.new_password != request.confirm_new_password:
        raise HTTPException(
            status_code=400,
            detail="Mật khẩu mới và mật khẩu nhập lại không giống nhau!",
        )
    owner = await session.scalar(
        select(Owner).where(Owner.ten_dang_nhap == username).with_for_update()
    )
    if owner is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        valid_old_password = bcrypt.checkpw(
            request.current_password.encode("utf-8"), owner.mat_khau.encode("utf-8")
        )
    except ValueError:
        valid_old_password = False
    if not valid_old_password:
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng!")
    owner.mat_khau = bcrypt.hashpw(
        request.new_password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")
    await session.commit()
    return AuthMessage(message="Đổi mật khẩu thành công")
