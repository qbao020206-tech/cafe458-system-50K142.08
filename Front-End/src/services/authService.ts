import api from "./api";
import { LoginPayload, LoginResponse } from "../types/auth";
import { getUnconfirmedCountSync } from "./adminOrderService";

export interface ChangePasswordPayload {
  mat_khau_cu: string;
  mat_khau_moi: string;
}

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
      const currentPassword =
        localStorage.getItem("cafe458_admin_password") || "123456";
      // Đúng tài khoản chuẩn UC 1
      if (
        payload.ten_dang_nhap.trim() === "chuquan458" &&
        payload.mat_khau === currentPassword
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

export const changePasswordApi = async (
  payload: ChangePasswordPayload,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.post<{ success: boolean; message?: string }>(
      "/auth/change-password",
      payload,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw error;
    }
    // Giả lập đổi mật khẩu khi Back-End chưa chạy (offline)
    if (!error.response) {
      const currentPassword =
        localStorage.getItem("cafe458_admin_password") || "123456";
      if (payload.mat_khau_cu !== currentPassword) {
        const err = new Error("Mật khẩu cũ không đúng!");
        (err as any).isOldPasswordWrong = true;
        throw err;
      }
      // Cập nhật mật khẩu mới vào localStorage
      localStorage.setItem("cafe458_admin_password", payload.mat_khau_moi);
      return { success: true, message: "Đổi mật khẩu thành công!" };
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
