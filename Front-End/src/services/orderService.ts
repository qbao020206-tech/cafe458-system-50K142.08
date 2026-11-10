import api from "./api";
import { CreateOrderPayload, CreateOrderResponse } from "../types/order";

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> => {
  try {
    const response = await api.post<CreateOrderResponse>(
      "/customer/orders",
      payload,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw error;
    }
    // Giả lập lưu đơn thành công khi thử nghiệm Front-End offline
    if (!error.response && payload.qr_code !== "trigger_fail") {
      return {
        ma_don_hang: Math.floor(Math.random() * 1000) + 1,
        so_ban: payload.qr_code.replace("ban", "") || "03",
        thoi_gian_dat: new Date().toISOString(),
        trang_thai: "Chưa xác nhận thanh toán",
        tong_tien: 85000,
      };
    }
    throw error;
  }
};
