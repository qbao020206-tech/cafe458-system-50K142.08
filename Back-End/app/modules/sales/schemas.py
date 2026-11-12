from pydantic import BaseModel


class RevenueItem(BaseModel):
    ky: str
    doanh_thu: int


class RevenueReportResponse(BaseModel):
    period: str
    items: list[RevenueItem]


class PaymentMethodRevenue(BaseModel):
    tien_mat: int
    chuyen_khoan: int
    tong: int


class DishSalesDetail(BaseModel):
    ma_mon: int
    ten_mon: str
    so_luong: int
    doanh_thu: int
    ban_chay_nhat: bool = False


class SalesStatistics(BaseModel):
    tong_so_ly: int
    mon_ban_chay_nhat: list[str]
    cac_mon: list[DishSalesDetail]


class ReportDetailsResponse(BaseModel):
    period: str
    date: str | None = None
    doanh_thu_theo_phuong_thuc: PaymentMethodRevenue
    thong_ke_ban_hang: SalesStatistics
