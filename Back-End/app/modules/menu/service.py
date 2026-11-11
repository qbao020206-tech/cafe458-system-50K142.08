from datetime import UTC, datetime, timedelta
from io import BytesIO
import uuid

import httpx
from PIL import Image, UnidentifiedImageError
from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AppError
from app.modules.menu.models import MenuItem, MenuItemStatus
from app.modules.menu.schemas import MenuItemInput, MenuItemUpdate
from app.modules.orders.models import CafeOrder, OrderItem, OrderStatus
from app.modules.settings.service import get_recommendation_settings
from app.modules.tables.models import CafeTable

MAX_IMAGE_BYTES = 2 * 1024 * 1024
IMAGE_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    if image_path.startswith(("https://", "http://")):
        return image_path
    settings = get_settings()
    if not settings.supabase_url:
        return None
    return (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/"
        f"{settings.supabase_storage_bucket}/{image_path.lstrip('/')}"
    )


async def customer_menu(session: AsyncSession, qr_token: str):
    table = await session.scalar(
        select(CafeTable).where(
            CafeTable.ma_qr == qr_token, CafeTable.da_xoa.is_(False)
        )
    )
    if table is None:
        raise AppError("QR_INVALID", "Mã QR không hợp lệ", 404)
    now = datetime.now(UTC)
    recommendation_limit, recommendation_lookback_days = await get_recommendation_settings()
    cutoff = now - timedelta(days=recommendation_lookback_days)
    items = (
        await session.execute(
            select(MenuItem)
            .where(
                MenuItem.da_xoa.is_(False),
                MenuItem.trang_thai == MenuItemStatus.VISIBLE,
            )
            .order_by(MenuItem.ma_mon.asc())
        )
    ).scalars().all()
    popular_ids = set()
    if items:
        popular_ids = set(
            (
                await session.execute(
                    select(OrderItem.ma_mon)
                    .join(CafeOrder, CafeOrder.ma_don_hang == OrderItem.ma_don_hang)
                    .where(
                        CafeOrder.da_xoa.is_(False),
                        CafeOrder.trang_thai == OrderStatus.PAID,
                        CafeOrder.thoi_gian_giao_dich >= cutoff,
                        OrderItem.ma_mon.in_([item.ma_mon for item in items]),
                    )
                    .group_by(OrderItem.ma_mon)
                    .order_by(func.sum(OrderItem.so_luong).desc(), OrderItem.ma_mon.asc())
                    .limit(
                        min(recommendation_limit, len(items))
                        if recommendation_limit is not None
                        else None
                    )
                )
            ).scalars().all()
        )
    return table, items, popular_ids


async def list_admin_menu(session: AsyncSession) -> list[MenuItem]:
    return list(
        (
            await session.execute(
                select(MenuItem)
                .where(MenuItem.da_xoa.is_(False))
                .order_by(MenuItem.ma_mon.desc())
            )
        ).scalars().all()
    )


async def create_menu_item(session: AsyncSession, request: MenuItemInput) -> MenuItem:
    name = request.ten_mon.strip()
    if not name:
        raise AppError("VALIDATION_ERROR", "Không được để trống!", 422, "ten_mon")
    duplicate = await session.scalar(
        select(MenuItem.ma_mon).where(
            MenuItem.da_xoa.is_(False), func.lower(MenuItem.ten_mon) == name.lower()
        )
    )
    if duplicate is not None:
        raise AppError("MENU_NAME_EXISTS", "Tên món đã tồn tại!", 422, "ten_mon")
    item = MenuItem(
        ten_mon=name,
        gia_ban=request.gia_ban,
        hinh_anh=request.hinh_anh,
        trang_thai=MenuItemStatus.VISIBLE,
    )
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


async def update_menu_item(
    session: AsyncSession, item_id: int, request: MenuItemUpdate
) -> MenuItem:
    item = await session.scalar(
        select(MenuItem)
        .where(MenuItem.ma_mon == item_id, MenuItem.da_xoa.is_(False))
        .with_for_update()
    )
    if item is None:
        raise AppError("MENU_ITEM_NOT_FOUND", "Không tìm thấy món", 404)
    values = request.model_dump(exclude_unset=True)
    if "ten_mon" in values:
        name = values["ten_mon"].strip() if values["ten_mon"] else ""
        if not name:
            raise AppError("VALIDATION_ERROR", "Không được để trống!", 422, "ten_mon")
        duplicate = await session.scalar(
            select(MenuItem.ma_mon).where(
                MenuItem.da_xoa.is_(False),
                MenuItem.ma_mon != item_id,
                func.lower(MenuItem.ten_mon) == name.lower(),
            )
        )
        if duplicate is not None:
            raise AppError("MENU_NAME_EXISTS", "Tên món đã tồn tại!", 422, "ten_mon")
        item.ten_mon = name
    if "gia_ban" in values:
        if values["gia_ban"] is None or values["gia_ban"] <= 0:
            raise AppError("INVALID_PRICE", "Giá bán phải là số lớn hơn 0!", 422, "gia_ban")
        item.gia_ban = values["gia_ban"]
    if "hinh_anh" in values:
        item.hinh_anh = values["hinh_anh"]
    if values.get("trang_thai") is not None:
        try:
            item.trang_thai = MenuItemStatus(values["trang_thai"])
        except ValueError as error:
            raise AppError("INVALID_STATUS", "Trạng thái món không hợp lệ", 422) from error
    await session.commit()
    await session.refresh(item)
    return item


async def soft_delete_menu_item(session: AsyncSession, item_id: int) -> None:
    item = await session.scalar(
        select(MenuItem)
        .where(MenuItem.ma_mon == item_id, MenuItem.da_xoa.is_(False))
        .with_for_update()
    )
    if item is None:
        raise AppError("MENU_ITEM_NOT_FOUND", "Không tìm thấy món", 404)
    item.da_xoa = True
    await session.commit()


async def upload_menu_image(upload: UploadFile) -> tuple[str, str]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise AppError("STORAGE_NOT_CONFIGURED", "Lưu trữ hình ảnh chưa được cấu hình", 503)
    extension = IMAGE_TYPES.get(upload.content_type or "")
    if extension is None:
        raise AppError("IMAGE_TYPE_INVALID", "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP", 400)
    content = await upload.read(MAX_IMAGE_BYTES + 1)
    if not content or len(content) > MAX_IMAGE_BYTES:
        raise AppError("IMAGE_SIZE_INVALID", "Ảnh phải có dung lượng không quá 2 MB", 400)
    try:
        with Image.open(BytesIO(content)) as image:
            actual_format = image.format
            image.verify()
    except (UnidentifiedImageError, OSError, ValueError) as error:
        raise AppError("IMAGE_INVALID", "Tệp tải lên không phải ảnh hợp lệ", 400) from error
    if actual_format not in {"JPEG", "PNG", "WEBP"}:
        raise AppError("IMAGE_TYPE_INVALID", "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP", 400)
    expected_format = {"jpg": "JPEG", "png": "PNG", "webp": "WEBP"}[extension]
    if actual_format != expected_format:
        raise AppError("IMAGE_TYPE_INVALID", "Định dạng ảnh không khớp với nội dung tệp", 400)
    path = f"menu/{uuid.uuid4().hex}.{extension}"
    bucket = settings.supabase_storage_bucket
    url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/{bucket}/{path}"
    key = settings.supabase_service_role_key.get_secret_value()
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                url,
                content=content,
                headers={
                    "Authorization": f"Bearer {key}",
                    "apikey": key,
                    "Content-Type": upload.content_type or "application/octet-stream",
                    "x-upsert": "false",
                },
            )
            response.raise_for_status()
    except httpx.HTTPError as error:
        raise AppError("STORAGE_UPLOAD_FAILED", "Có lỗi xảy ra, vui lòng thử lại!", 502) from error
    public_url = image_url(path)
    return path, public_url or ""
