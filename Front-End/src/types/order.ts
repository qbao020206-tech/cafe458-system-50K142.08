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

export interface OrderItemPayload {
  ma_mon: number;
  so_luong: number;
}

export interface CreateOrderPayload {
  qr?: string;
  qr_token?: string;
  items: OrderItemPayload[];
  phuong_thuc_thanh_toan: PaymentMethod;
  ghi_chu?: string | null;
  qr_code?: string; // fallback
}

export interface CreatedOrderResponse {
  message: string;
  order_id: number;
  total_amount: number;
  payment_method: PaymentMethod;
  status: string;
  placed_at: string;
  // Fallback properties for backward compatibility
  ma_don_hang?: number;
  so_ban?: string;
  tong_tien?: number;
  thoi_gian_dat?: string;
}

export interface OrderPreviewItem {
  ma_mon: number;
  ten_mon: string;
  gia: number;
  so_luong: number;
  thanh_tien: number;
}

export interface OrderPreviewPayload {
  qr?: string;
  qr_token?: string;
  items: OrderItemPayload[];
  phuong_thuc_thanh_toan: PaymentMethod;
}

export interface OrderPreviewResponse {
  ma_ban: number;
  so_ban: string;
  items: OrderPreviewItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  payment_qr_url: string | null;
  payment_message: string | null;
}
