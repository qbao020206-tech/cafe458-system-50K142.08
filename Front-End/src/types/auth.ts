export interface LoginPayload {
  ten_dang_nhap: string;
  mat_khau: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  ten_dang_nhap?: string;
  token?: string; // fallback
}

export interface ChangePasswordPayload {
  mat_khau_cu: string;
  mat_khau_moi: string;
  nhap_lai_mat_khau_moi: string;
}

export interface AuthMessageResponse {
  message: string;
}

export interface UnreadOrdersResponse {
  unread_count: number;
  has_new_order?: boolean;
  latest_order_id?: number | null;
  count?: number; // fallback
}
