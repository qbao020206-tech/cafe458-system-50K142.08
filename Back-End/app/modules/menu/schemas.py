from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class MenuItemInput(BaseModel):
    ten_mon: str
    gia_ban: int
    hinh_anh: str | None = Field(default=None, max_length=255)

    @field_validator("ten_mon")
    @classmethod
    def validate_ten_mon(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Không được để trống!")
        if len(v.strip()) > 50:
            raise ValueError("Tên món tối đa 50 ký tự")
        return v.strip()

    @field_validator("gia_ban")
    @classmethod
    def validate_gia_ban(cls, v: int) -> int:
        if v is None:
            raise ValueError("Không được để trống!")
        if v <= 0:
            raise ValueError("Giá bán phải là số lớn hơn 0!")
        if 0 < v < 1000:
            return v * 1000
        return v


class MenuItemUpdate(BaseModel):
    ten_mon: str | None = Field(default=None, max_length=50)
    gia_ban: int | None = Field(default=None)
    hinh_anh: str | None = Field(default=None, max_length=255)
    trang_thai: str | None = Field(default=None)

    model_config = ConfigDict(extra="forbid")

    @field_validator("ten_mon")
    @classmethod
    def validate_update_ten_mon(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Không được để trống!")
        return v.strip() if v is not None else None

    @field_validator("gia_ban")
    @classmethod
    def validate_update_gia_ban(cls, v: int | None) -> int | None:
        if v is not None and v <= 0:
            raise ValueError("Giá bán phải là số lớn hơn 0!")
        if v is not None and 0 < v < 1000:
            return v * 1000
        return v

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


class MenuItemCreateOutput(MenuItemOutput):
    message: str = "Thêm món thành công"


class MenuItemUpdateOutput(BaseModel):
    message: str = "Cập nhật món thành công"
    item: MenuItemOutput


class CustomerMenuOutput(BaseModel):
    ma_ban: int
    so_ban: str
    menu: list[MenuItemOutput]


class MessageOutput(BaseModel):
    message: str


class ImageUploadOutput(BaseModel):
    image_path: str
    image_url: str
