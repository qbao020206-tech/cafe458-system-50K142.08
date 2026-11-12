export type OrderStatus = "Chưa xác nhận thanh toán" | "Đã xác nhận thanh toán";

export interface OrderItem {
  ma_mon?: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface AdminOrder {
  id: string; // e.g. "0105"
  displayId?: string; // e.g. "#0105"
  numericId?: number; // 105
  tableNumber: string; // e.g. "05"
  date: string; // "31/10/2026"
  time: string; // "10:24"
  status: OrderStatus;
  items: OrderItem[];
  total: number; // 70000
  paymentMethod: "Tiền mặt" | "Chuyển khoản";
  note?: string;
  isDeleted?: boolean;
}
