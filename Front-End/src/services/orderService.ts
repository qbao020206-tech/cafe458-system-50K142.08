import api from "./api";
import {
  CreateOrderPayload,
  CreatedOrderResponse,
  OrderPreviewPayload,
  OrderPreviewResponse,
} from "../types/order";

export const previewOrder = async (
  payload: OrderPreviewPayload
): Promise<OrderPreviewResponse> => {
  const token = payload.qr || payload.qr_token || "";
  const requestBody = {
    qr: token,
    qr_token: token,
    items: payload.items.map((i) => ({
      ma_mon: i.ma_mon,
      so_luong: i.so_luong,
    })),
    phuong_thuc_thanh_toan: payload.phuong_thuc_thanh_toan,
  };

  const response = await api.post<OrderPreviewResponse>(
    "/customer/orders/preview",
    requestBody
  );
  return response.data;
};

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreatedOrderResponse> => {
  const token = payload.qr || payload.qr_token || payload.qr_code || "";
  const requestBody = {
    qr: token,
    qr_token: token,
    items: payload.items.map((i) => ({
      ma_mon: i.ma_mon,
      so_luong: i.so_luong,
    })),
    phuong_thuc_thanh_toan: payload.phuong_thuc_thanh_toan,
    ghi_chu: payload.ghi_chu || null,
  };

  const response = await api.post<CreatedOrderResponse>(
    "/customer/orders",
    requestBody
  );
  return response.data;
};
