export type PaymentMethod = "Chuyển khoản" | "Tiền mặt";

export interface CartItem {
  dish: {
    ma_mon: number;
    ten_mon: string;
    gia_ban: number;
    hinh_anh: string | null;
  };
  quantity: number;
}

export interface CreateOrderPayload {
  qr_code: string;
  items: Array<{
    ma_mon: number;
    so_luong: number;
  }>;
  phuong_thuc_thanh_toan: PaymentMethod;
  ghi_chu?: string | null;
}

export interface CreateOrderResponse {
  ma_don_hang: number;
  so_ban: string;
  thoi_gian_dat: string;
  trang_thai: string;
  tong_tien: number;
}
