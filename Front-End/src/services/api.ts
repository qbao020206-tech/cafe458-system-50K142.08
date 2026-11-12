import axios, { AxiosError } from "axios";

export interface ApiErrorDetail {
  code: string;
  message: string;
  field: string | null;
  status?: number;
}

/**
 * Trích xuất lỗi chuẩn hóa QĐ-21: {"error": {"code": "...", "message": "...", "field": "..."}}
 */
export const extractApiError = (err: unknown): ApiErrorDetail => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const errorData = err.response?.data?.error;

    if (errorData && typeof errorData === "object") {
      return {
        code: errorData.code || "UNKNOWN_ERROR",
        message: errorData.message || "Có lỗi xảy ra, vui lòng thử lại!",
        field: errorData.field ?? null,
        status,
      };
    }

    // Trường hợp lỗi FastAPI validation mặc định nếu có
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (typeof detail === "string") {
        return {
          code: "VALIDATION_ERROR",
          message: detail,
          field: null,
          status,
        };
      }
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0];
        const field = first.loc ? String(first.loc[first.loc.length - 1]) : null;
        return {
          code: "VALIDATION_ERROR",
          message: first.msg || "Không được để trống!",
          field,
          status,
        };
      }
    }

    if (!err.response) {
      return {
        code: "NETWORK_ERROR",
        message: "Không thể kết nối đến máy chủ, vui lòng thử lại!",
        field: null,
        status: 0,
      };
    }

    return {
      code: "HTTP_ERROR",
      message: err.message || "Có lỗi xảy ra, vui lòng thử lại!",
      field: null,
      status,
    };
  }

  if (err instanceof Error) {
    return {
      code: (err as any).code || "CLIENT_ERROR",
      message: err.message,
      field: (err as any).field ?? null,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Có lỗi xảy ra, vui lòng thử lại!",
    field: null,
  };
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Gán token vào header Authorization
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("cafe458_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động điều hướng về /login khi nhận 401 từ admin API hoặc đổi mật khẩu
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAdminRoute = url.includes("/admin") || url.includes("/auth/password");
      if (isAdminRoute) {
        sessionStorage.removeItem("cafe458_token");
        sessionStorage.removeItem("cafe458_user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
