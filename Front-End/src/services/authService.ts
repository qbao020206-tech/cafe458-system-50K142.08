import api from "./api";
import {
  LoginPayload,
  LoginResponse,
  ChangePasswordPayload,
  AuthMessageResponse,
  UnreadOrdersResponse,
} from "../types/auth";

export const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
};

export const logoutApi = async (): Promise<AuthMessageResponse> => {
  const response = await api.post<AuthMessageResponse>("/auth/logout");
  return response.data;
};

export const changePasswordApi = async (
  payload: ChangePasswordPayload
): Promise<AuthMessageResponse> => {
  const response = await api.put<AuthMessageResponse>("/auth/password", payload);
  return response.data;
};

export const getUnconfirmedOrdersCount = async (): Promise<number> => {
  try {
    const response = await api.get<UnreadOrdersResponse>(
      "/admin/notifications/unread-orders"
    );
    return response.data.unread_count ?? response.data.count ?? 0;
  } catch {
    return 0;
  }
};
