import api from "./api";
import { AdminOrder, OrderItem } from "../types/adminOrder";

const parseOrderId = (id: string | number): number => {
  if (typeof id === "number") return id;
  const clean = id.replace("#", "").trim();
  return parseInt(clean, 10);
};

// Chuyển đổi định dạng "DD/MM/YYYY" sang "YYYY-MM-DD" cho API query
const toApiDateString = (displayDate: string): string => {
  if (displayDate.includes("-")) return displayDate;
  const parts = displayDate.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return displayDate;
};

// Định dạng thời gian từ ISO datetime sang "DD/MM/YYYY" và "HH:mm"
const formatDateTime = (isoStr: string) => {
  try {
    const d = new Date(isoStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    };
  } catch {
    return {
      date: "31/10/2026",
      time: "10:00",
    };
  }
};

export const getOrdersByDate = async (
  date: string
): Promise<AdminOrder[]> => {
  const apiDate = toApiDateString(date);
  const response = await api.get<any[]>("/admin/orders", {
    params: { date: apiDate },
  });

  return (response.data || []).map((order) => {
    const { date: dStr, time: tStr } = formatDateTime(order.thoi_gian_dat);
    return {
      id: order.ma_don_hang.toString().padStart(4, "0"),
      displayId: order.ma_don_hang_hien_thi || `#${order.ma_don_hang.toString().padStart(4, "0")}`,
      numericId: order.ma_don_hang,
      tableNumber: String(order.so_ban),
      date: dStr,
      time: tStr,
      status: order.trang_thai,
      items: [],
      total: order.tong_tien,
      paymentMethod: order.phuong_thuc_thanh_toan,
      note: order.ghi_chu || "",
    };
  });
};

export const getOrderDetail = async (
  id: string
): Promise<AdminOrder | null> => {
  const numericId = parseOrderId(id);
  if (isNaN(numericId)) return null;

  const response = await api.get<any>(`/admin/orders/${numericId}`);
  const order = response.data;
  if (!order) return null;

  const { date: dStr, time: tStr } = formatDateTime(order.thoi_gian_dat);
  const items: OrderItem[] = (order.chi_tiet || []).map((item: any) => ({
    ma_mon: item.ma_mon,
    name: item.ten_mon,
    price: item.gia,
    quantity: item.so_luong,
    total: item.thanh_tien,
  }));

  return {
    id: order.ma_don_hang.toString().padStart(4, "0"),
    displayId: order.ma_don_hang_hien_thi || `#${order.ma_don_hang.toString().padStart(4, "0")}`,
    numericId: order.ma_don_hang,
    tableNumber: String(order.so_ban),
    date: dStr,
    time: tStr,
    status: order.trang_thai,
    items,
    total: order.tong_tien,
    paymentMethod: order.phuong_thuc_thanh_toan,
    note: order.ghi_chu || "",
  };
};

export const confirmPaymentOrder = async (
  id: string
): Promise<AdminOrder> => {
  const numericId = parseOrderId(id);
  await api.patch(`/admin/orders/${numericId}/confirm-payment`);
  // Lấy chi tiết đơn cập nhật mới nhất
  const updated = await getOrderDetail(id);
  if (!updated) {
    throw new Error("Không tìm thấy đơn hàng");
  }
  return updated;
};

export const deleteAdminOrder = async (id: string): Promise<boolean> => {
  const numericId = parseOrderId(id);
  await api.delete(`/admin/orders/${numericId}`);
  return true;
};
