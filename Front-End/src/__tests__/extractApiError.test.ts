import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { extractApiError } from "../services/api";

describe("extractApiError - QĐ-21 standard error format", () => {
  it("extracts code, message, and field from standard error response", () => {
    const errorResponse = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Không được để trống!",
        field: "ten_dang_nhap",
      },
    };

    const axiosError = new AxiosError(
      "Request failed with status code 422",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        data: errorResponse,
        status: 422,
        statusText: "Unprocessable Entity",
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );

    const result = extractApiError(axiosError);
    expect(result).toEqual({
      code: "VALIDATION_ERROR",
      message: "Không được để trống!",
      field: "ten_dang_nhap",
      status: 422,
    });
  });

  it("extracts 401 login failure error properly", () => {
    const errorResponse = {
      error: {
        code: "UNAUTHORIZED",
        message: "Đăng nhập không thành công!",
        field: null,
      },
    };

    const axiosError = new AxiosError(
      "Request failed with status code 401",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        data: errorResponse,
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );

    const result = extractApiError(axiosError);
    expect(result.code).toBe("UNAUTHORIZED");
    expect(result.message).toBe("Đăng nhập không thành công!");
    expect(result.field).toBeNull();
    expect(result.status).toBe(401);
  });

  it("handles 409 table unresolved orders error", () => {
    const errorResponse = {
      error: {
        code: "TABLE_HAS_UNRESOLVED_ORDERS",
        message: "Có lỗi xảy ra, vui lòng thử lại!",
        field: null,
      },
    };

    const axiosError = new AxiosError(
      "Request failed with status code 409",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        data: errorResponse,
        status: 409,
        statusText: "Conflict",
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );

    const result = extractApiError(axiosError);
    expect(result).toEqual({
      code: "TABLE_HAS_UNRESOLVED_ORDERS",
      message: "Có lỗi xảy ra, vui lòng thử lại!",
      field: null,
      status: 409,
    });
  });

  it("handles generic Error instance", () => {
    const err = new Error("Lỗi kết nối");
    const result = extractApiError(err);
    expect(result.message).toBe("Lỗi kết nối");
  });
});
