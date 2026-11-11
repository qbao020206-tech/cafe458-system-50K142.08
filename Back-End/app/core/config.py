from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: SecretStr = SecretStr(
        "postgresql+asyncpg://postgres:postgres@localhost:5432/cafe458"
    )
    database_pool_size: int = Field(default=5, ge=1, le=50)
    database_max_overflow: int = Field(default=5, ge=0, le=50)
    app_timezone: str = "Asia/Ho_Chi_Minh"
    runtime_settings_path: Path = Path(".runtime/shop-settings.json")
    jwt_secret: SecretStr = SecretStr("local-development-only-change-before-deploying")
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = Field(default=12, ge=1, le=168)
    frontend_base_url: str = "http://localhost:5173"

    owner_username: str | None = None
    owner_password: SecretStr | None = None

    supabase_url: str | None = None
    supabase_service_role_key: SecretStr | None = None
    supabase_storage_bucket: str = "menu-images"

    bank_bin: SecretStr | None = None
    bank_name: SecretStr | None = None
    bank_account_no: SecretStr | None = None
    bank_account_name: SecretStr | None = None

    @property
    def sqlalchemy_database_url(self) -> str:
        """Return a SQLAlchemy async URL without exposing it in settings reprs."""
        url = self.database_url.get_secret_value()
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()
