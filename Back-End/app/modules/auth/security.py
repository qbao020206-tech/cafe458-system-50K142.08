from datetime import UTC, datetime, timedelta
import asyncio
import hashlib
import json
import os
from pathlib import Path
import tempfile

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.infrastructure.database import get_session
from app.modules.auth.models import Owner

bearer_scheme = HTTPBearer(auto_error=False)
_revoked_lock = asyncio.Lock()


def _revocations_path() -> Path:
    return get_settings().runtime_settings_path.with_name("revoked-tokens.json")


def _read_revoked(path: Path, token_hash: str) -> bool:
    try:
        entries = json.loads(path.read_text(encoding="utf-8"))
        return token_hash in entries
    except (OSError, json.JSONDecodeError, TypeError):
        return False


async def _is_revoked(token: str) -> bool:
    async with _revoked_lock:
        return await asyncio.to_thread(
            _read_revoked, _revocations_path(), hashlib.sha256(token.encode()).hexdigest()
        )


def _write_revoked(path: Path, token_hash: str, expires_at: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        entries = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, TypeError):
        entries = {}
    if not isinstance(entries, dict):
        entries = {}
    now = int(datetime.now(UTC).timestamp())
    entries = {key: value for key, value in entries.items() if value > now}
    entries[token_hash] = expires_at
    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent, delete=False
        ) as temporary_file:
            temporary_path = temporary_file.name
            json.dump(entries, temporary_file)
            temporary_file.flush()
            os.fsync(temporary_file.fileno())
        os.replace(temporary_path, path)
    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.unlink(temporary_path)


async def revoke_token(token: str, expires_at: int) -> None:
    async with _revoked_lock:
        await asyncio.to_thread(
            _write_revoked,
            _revocations_path(),
            hashlib.sha256(token.encode()).hexdigest(),
            expires_at,
        )


def create_owner_token(username: str) -> str:
    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(hours=settings.jwt_expire_hours)
    return jwt.encode(
        {"sub": username, "exp": expires_at},
        settings.jwt_secret.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )


async def require_owner(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> str:
    settings = get_settings()
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token đăng nhập không hợp lệ hoặc đã hết hạn",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.jwt_secret.get_secret_value(),
            algorithms=[settings.jwt_algorithm],
        )
        username = payload.get("sub")
    except jwt.PyJWTError as error:
        raise unauthorized from error
    if not username or await _is_revoked(token):
        raise unauthorized
    owner = await session.scalar(select(Owner).where(Owner.ten_dang_nhap == username))
    if owner is None:
        raise unauthorized
    return username
