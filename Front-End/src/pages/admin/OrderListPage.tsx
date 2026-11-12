import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { AdminOrder } from "../../types/adminOrder";
import {
  getOrdersByDate,
  deleteAdminOrder,
} from "../../services/adminOrderService";
import { formatCurrency } from "../../utils/formatCurrency";
import { ModalActionDialog } from "../../components/common/ModalActionDialog";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { OrderDatePickerModal } from "../../components/admin/OrderDatePickerModal";
import { EmptyClipboardIcon } from "../../components/common/EmptyClipboardIcon";
import { extractApiError } from "../../services/api";

export const OrderListPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState<string>("31/10/2026");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal chọn ngày
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  // Modal xác nhận xóa
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Modal thông báo thành công hoặc lỗi
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const fetchOrders = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const data = await getOrdersByDate(date);
      setOrders(data);
    } catch (err: unknown) {
      const apiErr = extractApiError(err);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: apiErr.message || "Có lỗi xảy ra, vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentDate);
  }, [currentDate, fetchOrders]);

  const handleOpenDeleteDialog = (id: string) => {
    setOrderToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await deleteAdminOrder(orderToDelete);
      setOrderToDelete(null);
      // Hiển thị thông báo thành công chuẩn UC 2.3: "Đã xóa đơn"
      setFeedbackModal({
        isOpen: true,
        type: "success",
        message: "Đã xóa đơn",
      });
      // Tải lại danh sách đơn
      fetchOrders(currentDate);

      // Tự động đóng thông báo sau 1.5 giây
      setTimeout(() => {
        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
      }, 1500);
    } catch (err: unknown) {
      const apiErr = extractApiError(err);
      setOrderToDelete(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: apiErr.message || "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  return (
    <AdminLayout
      title="Quản lý gọi món"
      showBackButton={true}
      onBackClick={() => navigate("/admin")}
      noMainPadding={true}
      breadcrumb={
        <div className="flex items-center space-x-1.5 text-[14px]">
          <span className="text-[#D1342C]">Danh sách đơn</span>
          <span className="text-[#666666]">&gt;&gt;</span>
          <span className="text-[#22201C] font-medium">{currentDate}</span>
        </div>
      }
    >
      {!(feedbackModal.isOpen && feedbackModal.type === "error") && (
        <div className="px-[16px] pt-4">
          {/* Hàng đếm số lượng đơn và nút chọn ngày */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] text-[#666666]">
              {orders.length} đơn hàng
            </span>

            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="bg-white border border-[#22201C] rounded-[10px] px-3 py-1.5 flex items-center space-x-2 text-[14px] text-[#22201C] font-medium active:scale-95 transition-transform cursor-pointer"
            >
              {/* Icon lịch */}
              <svg
                className="w-4 h-4 text-[#22201C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{currentDate}</span>
              {/* Icon mũi tên xổ xuống */}
              <svg
                className="w-3.5 h-3.5 text-[#22201C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Danh sách các đơn hàng hoặc màn hình rỗng */}
          {loading ? (
            <div className="py-20 text-center text-[#666666] text-[14px]">
              Đang tải danh sách...
            </div>
          ) : orders.length === 0 ? (
            /* Màn hình rỗng chuẩn UC 2.2 - Chưa có đơn nào */
            <div className="flex flex-col items-center justify-center pt-24 text-center">
              <EmptyClipboardIcon className="w-14 h-16 text-[#666666] mb-3" />
              <p className="text-[#666666] text-[16px] font-medium">
                Chưa có đơn nào
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="bg-white border border-[#E8E0D2] rounded-[16px] p-3.5 flex items-center justify-between cursor-pointer active:bg-orange-50/40 transition-colors shadow-sm"
                >
                  {/* Thông tin mã đơn, số bàn, giờ, tổng tiền */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-bold text-[16px] text-[#22201C] leading-snug">
                      Đơn #{order.id} · Bàn {order.tableNumber}
                    </div>
                    <div className="text-[14px] text-[#666666] mt-1">
                      {order.time} · {formatCurrency(order.total)}
                    </div>
                  </div>

                  {/* Nhãn trạng thái 2 dòng chuẩn Figma */}
                  <div className="mr-3 flex-shrink-0">
                    {order.status === "Chưa xác nhận thanh toán" ? (
                      <div className="bg-[#FBEBD3] text-[#5C3A0E] px-2.5 py-1.5 rounded-[12px] text-center text-[11px] font-semibold leading-tight flex flex-col justify-center">
                        <span>Chưa xác nhận</span>
                        <span>thanh toán</span>
                      </div>
                    ) : (
                      <div className="bg-[#D1EAE2] text-[#1E5642] px-2.5 py-1.5 rounded-[12px] text-center text-[11px] font-semibold leading-tight flex flex-col justify-center">
                        <span>Đã xác nhận</span>
                        <span>thanh toán</span>
                      </div>
                    )}
                  </div>

                  {/* Nút Xóa đỏ đậm chuẩn Figma */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeleteDialog(order.id);
                    }}
                    className="w-[58px] h-[44px] rounded-[14px] bg-[#8A2424] text-white font-bold text-[15px] flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal chọn ngày */}
      <OrderDatePickerModal
        isOpen={isDatePickerOpen}
        currentDate={currentDate}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectDate={(newDate) => setCurrentDate(newDate)}
      />

      {/* Modal xác nhận xóa đơn chuẩn UC 2.3 */}
      <ModalActionDialog
        isOpen={!!orderToDelete}
        question="Bạn có chắc chắn muốn xóa đơn này không?"
        cancelText="Hủy"
        confirmText="Xóa"
        onCancel={() => setOrderToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal thông báo kết quả (Đã xóa đơn / Lỗi) */}
      <ModalConfirm
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </AdminLayout>
  );
};
