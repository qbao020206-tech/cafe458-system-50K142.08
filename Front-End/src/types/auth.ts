export interface LoginPayload {
  ten_dang_nhap: string;
  mat_khau: string;
}

export interface LoginResponse {
  token: string;
  ten_dang_nhap: string;
}

export interface UnconfirmedOrdersCountResponse {
  count: number;
}
