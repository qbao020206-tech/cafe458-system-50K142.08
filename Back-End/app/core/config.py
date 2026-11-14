import re
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
    def primary_frontend_url(self) -> str:
        """Lấy URL frontend chính để in mã QR. Tự động làm sạch các lỗi dán nhầm key=value hoặc sai format giao thức."""
        raw = (self.frontend_base_url or "").strip().strip("\"'")
        if "=" in raw:
            raw = raw.split("=", 1)[-1].strip().strip("\"'")

        parts = [p.strip().rstrip("/") for p in raw.split(",") if p.strip()]
        chosen = parts[0] if parts else "http://localhost:5173"
        for p in parts:
            if "vercel.app" in p or "https://" in p:
                chosen = p
                break

        if "=" in chosen:
            chosen = chosen.split("=", 1)[-1].strip().strip("\"'")

        # Khắc phục trường hợp thiếu dấu hai chấm (https// hoặc http//)
        chosen = re.sub(r"^(https?)//+", r"\1://", chosen)
        chosen = re.sub(r"^(https?):/+", r"\1://", chosen)

        # Nếu chứa domain vercel.app
        vercel_match = re.search(r"([a-zA-Z0-9-]+\.vercel\.app)", chosen)
        if vercel_match:
            return f"https://{vercel_match.group(1)}"

        # Nếu là localhost
        if "localhost" in chosen:
            port_match = re.search(r":(\d+)", chosen)
            port = port_match.group(1) if port_match else "5173"
            return f"http://localhost:{port}"

        domain_match = re.search(r"(https?://)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})", chosen)
        if domain_match:
            host = domain_match.group(2)
            scheme = domain_match.group(1) or "https://"
            return f"{scheme.rstrip('/')}//{host}"

        if not chosen.startswith("http://") and not chosen.startswith("https://"):
            chosen = f"https://{chosen}"

        return chosen.rstrip("/")

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
