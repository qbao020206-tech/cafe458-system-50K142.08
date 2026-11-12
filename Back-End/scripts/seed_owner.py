import asyncio
import os
import sys

import bcrypt
from sqlalchemy import select

from app.core.config import get_settings
from app.infrastructure.database import SessionFactory, engine
from app.modules.auth.models import Owner


async def seed_owner() -> None:
    settings = get_settings()
    username = os.getenv("OWNER_USERNAME") or settings.owner_username or "admin"
    password = (
        os.getenv("OWNER_PASSWORD")
        or (settings.owner_password.get_secret_value() if settings.owner_password else None)
        or "Admin@123456"
    )

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    async with SessionFactory() as session:
        async with session.begin():
            existing = await session.scalar(
                select(Owner).where(Owner.ten_dang_nhap == username)
            )
            if existing:
                print(f"[seed_owner] Owner already exists: {username}, keeping existing password.")
            else:
                owner = Owner(ten_dang_nhap=username, mat_khau=hashed)
                session.add(owner)
                print(f"[seed_owner] Created new owner: {username}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_owner())
