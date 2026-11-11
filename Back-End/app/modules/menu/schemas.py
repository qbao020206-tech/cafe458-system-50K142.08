from pydantic import BaseModel, ConfigDict, Field, model_validator


class MenuItemInput(BaseModel):
    ten_mon: str = Field(min_length=1, max_length=50)
    gia_ban: int = Field(gt=0)
    hinh_anh: str | None = Field(default=None, max_length=255)


class MenuItemUpdate(BaseModel):
    ten_mon: str | None = Field(default=None, min_length=1, max_length=50)
    gia_ban: int | None = Field(default=None, gt=0)
    hinh_anh: str | None = Field(default=None, max_length=255)
    trang_thai: str | None = Field(default=None)

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def require_a_field(self) -> "MenuItemUpdate":
        if not self.model_fields_set:
            raise ValueError("Cần cung cấp ít nhất một thông tin cần cập nhật")
        if self.trang_thai is not None and self.trang_thai not in {"Hiển thị", "Ẩn"}:
            raise ValueError("Trạng thái món không hợp lệ")
        return self


class MenuItemOutput(BaseModel):
    ma_mon: int
    ten_mon: str
    gia_ban: int
    hinh_anh: str | None
    trang_thai: str
    ban_chay: bool = False


class CustomerMenuOutput(BaseModel):
    ma_ban: int
    so_ban: str
    menu: list[MenuItemOutput]


class MessageOutput(BaseModel):
    message: str


class ImageUploadOutput(BaseModel):
    image_path: str
    image_url: str
