from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.orders.models import PaymentMethod


class OrderItemInput(BaseModel):
    menu_item_id: int = Field(alias="ma_mon", gt=0)
    quantity: int = Field(alias="so_luong", gt=0)

    model_config = ConfigDict(populate_by_name=True)


class CreateOrderInput(BaseModel):
    qr_token: str = Field(min_length=1, max_length=255)
    items: list[OrderItemInput] = Field(min_length=1)
    payment_method: PaymentMethod = Field(alias="phuong_thuc_thanh_toan")
    note: str | None = Field(default=None, alias="ghi_chu", max_length=200)

    model_config = ConfigDict(populate_by_name=True)


class CreatedOrder(BaseModel):
    order_id: int
    total_amount: int
    payment_method: PaymentMethod
    status: str
    placed_at: datetime
    transfer_confirmation_deadline: datetime | None


class PaymentPreviewItem(BaseModel):
    ma_mon: int
    ten_mon: str
    gia: int
    so_luong: int
    thanh_tien: int


class OrderPreviewInput(BaseModel):
    qr_token: str = Field(min_length=1, max_length=255)
    items: list[OrderItemInput] = Field(min_length=1)
    payment_method: PaymentMethod = Field(alias="phuong_thuc_thanh_toan")

    model_config = ConfigDict(populate_by_name=True)


class OrderPreviewOutput(BaseModel):
    ma_ban: int
    so_ban: str
    items: list[PaymentPreviewItem]
    total_amount: int
    payment_method: PaymentMethod
    payment_qr_url: str | None = None
    payment_message: str | None = None


class OrderLineOutput(BaseModel):
    ma_mon: int
    ten_mon: str
    gia: int
    so_luong: int
    thanh_tien: int


class OrderOutput(BaseModel):
    ma_don_hang: int
    ma_don_hang_hien_thi: str
    ma_ban: int
    so_ban: str
    thoi_gian_dat: datetime
    phuong_thuc_thanh_toan: PaymentMethod
    ghi_chu: str | None
    trang_thai: str
    tong_tien: int
    chi_tiet: list[OrderLineOutput]


class OrderMessage(BaseModel):
    message: str
