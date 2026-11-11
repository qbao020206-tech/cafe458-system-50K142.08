from io import BytesIO
from urllib.parse import quote

import qrcode
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.modules.auth.security import require_owner
from app.modules.tables.schemas import TableCreateInput, TableDeleteOutput, TableMessage, TableOutput
from app.modules.tables.service import (
    create_table,
    customer_menu_url,
    delete_empty_table,
    get_active_table,
    list_tables,
    mark_table_empty,
)

router = APIRouter(prefix="/admin/tables", tags=["tables"])


def _table_output(table) -> TableOutput:
    return TableOutput(
        ma_ban=table.ma_ban,
        so_ban=table.so_ban,
        trang_thai=table.trang_thai.value,
        qr_download_url=f"/api/v1/admin/tables/{table.ma_ban}/qr-image",
    )


@router.get("", response_model=list[TableOutput])
async def read_tables(
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> list[TableOutput]:
    return [_table_output(table) for table in await list_tables(session)]


@router.post("", response_model=TableOutput, status_code=status.HTTP_201_CREATED)
async def add_table(
    request: TableCreateInput,
    username: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> TableOutput:
    return _table_output(await create_table(session, username, request.so_ban))


@router.get("/{table_id}/qr-image")
async def download_table_qr(
    table_id: int,
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> Response:
    table = await get_active_table(session, table_id)
    qr = qrcode.make(customer_menu_url(table.ma_qr))
    image = BytesIO()
    qr.save(image, format="PNG")
    filename = quote(f"QR_Ban_{table.so_ban}.png", safe="")
    return Response(
        content=image.getvalue(),
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"},
    )


@router.delete("/{table_id}", response_model=TableDeleteOutput)
async def remove_table(
    table_id: int,
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> TableDeleteOutput:
    await delete_empty_table(session, table_id)
    return TableDeleteOutput(message="Đã xóa bàn và vô hiệu hóa mã QR", invalidated_qr=True)


@router.patch("/{table_id}/empty", response_model=TableMessage)
async def confirm_table_empty(
    table_id: int,
    _: str = Depends(require_owner),
    session: AsyncSession = Depends(get_session),
) -> TableMessage:
    await mark_table_empty(session, table_id)
    return TableMessage(message="Đã xác nhận bàn trống")
