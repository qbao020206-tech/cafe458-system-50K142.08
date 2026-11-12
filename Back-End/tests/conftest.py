import asyncio
from collections.abc import AsyncIterator

import bcrypt
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings
from app.infrastructure.database import get_session
from app.main import app
from app.modules.auth.models import Owner
from app.modules.auth.security import create_owner_token

test_engine = create_async_engine(
    get_settings().sqlalchemy_database_url,
    poolclass=NullPool,
)

TestSessionFactory = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def override_get_session() -> AsyncIterator[AsyncSession]:
    async with TestSessionFactory() as session:
        yield session


app.dependency_overrides[get_session] = override_get_session


@pytest.fixture(scope="session", autouse=True)
async def setup_test_owner():
    """Ensure the default owner exists in the database for testing."""
    async with TestSessionFactory() as session:
        async with session.begin():
            owner = await session.scalar(
                select(Owner).where(Owner.ten_dang_nhap == "admin")
            )
            if not owner:
                session.add(
                    Owner(
                        ten_dang_nhap="admin",
                        mat_khau=bcrypt.hashpw(b"Admin@123456", bcrypt.gensalt()).decode("utf-8"),
                    )
                )


@pytest.fixture
def admin_token() -> str:
    return create_owner_token("admin")


@pytest.fixture
def admin_headers(admin_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as ac:
        yield ac


@pytest.fixture
async def db_session():
    async with TestSessionFactory() as session:
        yield session
