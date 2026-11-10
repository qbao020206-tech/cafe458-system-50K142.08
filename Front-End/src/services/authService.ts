import api from "./api";
import { LoginPayload, LoginResponse } from "../types/auth";
import { getUnconfirmedCountSync } from "./adminOrderService";

export const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", payload);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw error;
    }
    // Giả lập đăng nhập khi Back-End chưa chạy (offline)
    if (!error.response) {
      // Đúng tài khoản chuẩn UC 1
      if (
        payload.ten_dang_nhap.trim() === "chuquan458" &&
        payload.mat_khau === "123456"
      ) {
        return {
          token: "mock-jwt-token-cafe458-chuquan",
          ten_dang_nhap: "chuquan458",
        };
      }
      // Nhập sai tài khoản hoặc mật khẩu
      const err = new Error("Đăng nhập không thành công!");
      (err as any).isLoginFailed = true;
      throw err;
    }
    throw error;
  }
};

export const getUnconfirmedOrdersCount = async (): Promise<number> => {
  try {
    const response = await api.get<{ count: number }>(
      "/admin/orders/unconfirmed-count",
    );
    return response.data.count;
  } catch {
    // Lấy số lượng thực tế từ service quản lý đơn
    return getUnconfirmedCountSync();
  }
};
