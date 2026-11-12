from pydantic import BaseModel, Field


class TableCreateInput(BaseModel):
    so_ban: str = Field(min_length=1, max_length=10)


class TableOutput(BaseModel):
    ma_ban: int
    so_ban: str
    trang_thai: str
    qr_download_url: str | None = None


class TableCreateOutput(TableOutput):
    message: str = "Thêm bàn thành công"


class TableMessage(BaseModel):
    message: str


class TableDeleteOutput(TableMessage):
    invalidated_qr: bool
