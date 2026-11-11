from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.modules.auth.security import require_owner
from app.modules.menu.models import MenuItem
from app.modules.menu.schemas import (
    CustomerMenuOutput,
    ImageUploadOutput,
    MenuItemInput,
    MenuItemOutput,
    MenuItemUpdate,
    MessageOutput,
)
from app.modules.menu.service import (
    create_menu_item,
    customer_menu,
    image_url,
    list_admin_menu,
    soft_delete_menu_item,
    update_menu_item,
    upload_menu_image,
)

customer_router = APIRouter(prefix="/customer", tags=["customer"])
admin_router = APIRouter(prefix="/admin/menu", tags=["menu"])


def _menu_output(item: MenuItem, *, popular: bool = False) -> MenuItemOutput:
    return MenuItemOutput(
        ma_mon=item.ma_mon,
        ten_mon=item.ten_mon,
        gia_ban=item.gia_ban,
        hinh_anh=image_url(item.hinh_anh),
        trang_thai=item.trang_thai.value,
        ban_chay=popular,
    )


@customer_router.get("/menu", response_model=CustomerMenuOutput)
async def read_customer_menu(
    qr_token: str,
    session: AsyncSession = Depends(get_session),
) -> CustomerMenuOutput:
    table, items, popular_ids = await customer_menu(session, qr_token)
    return CustomerMenuOutput(
        ma_ban=table.ma_ban,
        so_ban=table.so_ban,
        menu=[_menu_output(item, popular=item.ma_mon in popular_ids) for item in items],
    )


@admin_router.get("", response_model=list[MenuItemOutput])
async def read_admin_menu(
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> list[MenuItemOutput]:
    return [_menu_output(item) for item in await list_admin_menu(session)]


@admin_router.post("/upload-image", response_model=ImageUploadOutput)
async def upload_image(
    file: UploadFile = File(...),
    _: str = Depends(require_owner),
) -> ImageUploadOutput:
    path, url = await upload_menu_image(file)
    return ImageUploadOutput(image_path=path, image_url=url)


@admin_router.post("", response_model=MenuItemOutput, status_code=status.HTTP_201_CREATED)
async def add_menu_item(
    request: MenuItemInput,
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> MenuItemOutput:
    return _menu_output(await create_menu_item(session, request))


@admin_router.put("/{item_id}")
async def edit_menu_item(
    item_id: int,
    request: MenuItemUpdate,
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> dict[str, object]:
    item = await update_menu_item(session, item_id, request)
    return {"message": "Cập nhật món thành công", "item": _menu_output(item)}


@admin_router.delete("/{item_id}", response_model=MessageOutput)
async def delete_menu_item(
    item_id: int,
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> MessageOutput:
    await soft_delete_menu_item(session, item_id)
    return MessageOutput(message="Đã xóa món thành công")
