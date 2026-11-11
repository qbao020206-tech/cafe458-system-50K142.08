import asyncio
import json
import os
from pathlib import Path
import tempfile

from app.core.config import get_settings

DEFAULT_ORDER_TIMEOUT_MINUTES = 5
DEFAULT_RECOMMENDATION_LIMIT = 3
DEFAULT_RECOMMENDATION_LOOKBACK_DAYS = 30
_settings_lock = asyncio.Lock()


def _settings_path() -> Path:
    return get_settings().runtime_settings_path


def _read_runtime_settings(path: Path) -> dict[str, object]:
    try:
        content = json.loads(path.read_text(encoding="utf-8"))
        return content if isinstance(content, dict) else {}
    except (OSError, json.JSONDecodeError, AttributeError):
        return {}


def _write_runtime_settings(path: Path, settings: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent, delete=False
        ) as temporary_file:
            temporary_path = temporary_file.name
            json.dump(settings, temporary_file)
            temporary_file.flush()
            os.fsync(temporary_file.fileno())
        os.replace(temporary_path, path)
    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.unlink(temporary_path)


async def get_transfer_confirmation_timeout() -> int:
    async with _settings_lock:
        settings = await asyncio.to_thread(_read_runtime_settings, _settings_path())
        value = settings.get("transfer_confirmation_timeout_minutes")
        return value if isinstance(value, int) and 1 <= value <= 1440 else DEFAULT_ORDER_TIMEOUT_MINUTES


async def set_transfer_confirmation_timeout(minutes: int) -> int:
    if not 1 <= minutes <= 1440:
        raise ValueError("Thời hạn phải từ 1 đến 1440 phút")
    async with _settings_lock:
        path = _settings_path()
        settings = await asyncio.to_thread(_read_runtime_settings, path)
        settings["transfer_confirmation_timeout_minutes"] = minutes
        await asyncio.to_thread(_write_runtime_settings, path, settings)
    return minutes


async def get_recommendation_settings() -> tuple[int | None, int]:
    async with _settings_lock:
        settings = await asyncio.to_thread(_read_runtime_settings, _settings_path())
        count = settings.get("recommendation_limit", DEFAULT_RECOMMENDATION_LIMIT)
        if count is not None and (not isinstance(count, int) or count < 1):
            count = DEFAULT_RECOMMENDATION_LIMIT
        days = settings.get("recommendation_lookback_days", DEFAULT_RECOMMENDATION_LOOKBACK_DAYS)
        if not isinstance(days, int) or not 1 <= days <= 30:
            days = DEFAULT_RECOMMENDATION_LOOKBACK_DAYS
        return count, days


async def set_recommendation_settings(
    *, limit: int | None | object = ..., lookback_days: int | object = ...
) -> tuple[int | None, int]:
    if limit is not ... and limit is not None and (not isinstance(limit, int) or limit < 1):
        raise ValueError("Số món đề cử phải là số nguyên dương hoặc không giới hạn")
    if lookback_days is not ... and (
        not isinstance(lookback_days, int) or not 1 <= lookback_days <= 30
    ):
        raise ValueError("Khoảng thời gian đề cử phải từ 1 đến 30 ngày")
    async with _settings_lock:
        path = _settings_path()
        settings = await asyncio.to_thread(_read_runtime_settings, path)
        if limit is not ...:
            settings["recommendation_limit"] = limit
        if lookback_days is not ...:
            settings["recommendation_lookback_days"] = lookback_days
        await asyncio.to_thread(_write_runtime_settings, path, settings)
        count = settings.get("recommendation_limit", DEFAULT_RECOMMENDATION_LIMIT)
        days = settings.get("recommendation_lookback_days", DEFAULT_RECOMMENDATION_LOOKBACK_DAYS)
        return count, days
