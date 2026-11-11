import api from "./api";
import { CreateOrderPayload, CreateOrderResponse } from "../types/order";
import { addCustomerOrder } from "./adminOrderService";
import { setTableServing } from "./tableService";

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
      const tableNumber = payload.qr_code.replace("ban", "") || "03";

      // Lưu đơn vào danh sách đơn của admin để hiển thị trên giao diện quản trị
      const newAdminOrder = addCustomerOrder({
        tableNumber,
        items: payload.items,
        paymentMethod: payload.phuong_thuc_thanh_toan,
        note: payload.ghi_chu,
      });

      // Cập nhật trạng thái bàn sang "Đang phục vụ" (BR-UC4-01)
      setTableServing(tableNumber);

      return {
        ma_don_hang: parseInt(newAdminOrder.id, 10),
        so_ban: newAdminOrder.tableNumber,
        thoi_gian_dat: new Date().toISOString(),
        trang_thai: "Chưa xác nhận thanh toán",
        tong_tien: newAdminOrder.total,
      };
    }
    throw error;
  }
};
