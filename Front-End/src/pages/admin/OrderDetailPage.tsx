import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { AdminOrder } from "../../types/adminOrder";
import {
  getOrderDetail,
  confirmPaymentOrder,
  deleteAdminOrder,
} from "../../services/adminOrderService";
import { formatCurrency } from "../../utils/formatCurrency";
import { ModalActionDialog } from "../../components/common/ModalActionDialog";
import { ModalConfirm } from "../../components/common/ModalConfirm";

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Dialog xác nhận nhận tiền (UC 2.1)
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] =
    useState<boolean>(false);

  // Dialog xác nhận xóa đơn (UC 2.3)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Modal thông báo thành công hoặc lỗi
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
    onAfterClose?: () => void;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getOrderDetail(id);
      if (!data) {
        navigate("/admin/orders", { replace: true });
        return;
      }
      setOrder(data);
    } catch {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Có lỗi xảy ra, vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Xử lý xác nhận đã nhận tiền (UC 2.1)
  const handleConfirmPayment = async () => {
    if (!id) return;
    try {
      setIsConfirmPaymentOpen(false);
      const updated = await confirmPaymentOrder(id);
      setOrder(updated);

      // Hiển thị thông báo thành công chuẩn UC 2.1: "Xác nhận đã nhận tiền!"
      setFeedbackModal({
        isOpen: true,
        type: "success",
        message: "Xác nhận đã nhận tiền!",
      });

      setTimeout(() => {
        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
      }, 1500);
    } catch {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  // Xử lý xóa đơn (UC 2.3)
  const handleDeleteOrder = async () => {
    if (!id) return;
    try {
      setIsDeleteDialogOpen(false);
      await deleteAdminOrder(id);

      // Hiển thị thông báo thành công chuẩn UC 2.3: "Đã xóa đơn"
      setFeedbackModal({
        isOpen: true,
        type: "success",
        message: "Đã xóa đơn",
        onAfterClose: () => navigate("/admin/orders", { replace: true }),
      });

      // Sau 1.2s tự động quay về danh sách đơn
      setTimeout(() => {
        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
        navigate("/admin/orders", { replace: true });
      }, 1200);
    } catch {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  if (loading || !order) {
    return (
      <AdminLayout
        title="Quản lý gọi món"
        showBackButton={true}
        onBackClick={() => navigate("/admin/orders")}
        noMainPadding={true}
        breadcrumb={
          <div className="flex items-center space-x-1.5 text-[14px]">
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="text-[#D1342C] hover:underline cursor-pointer"
            >
              Danh sách đơn
            </button>
            <span className="text-[#666666]">&gt;&gt;</span>
            <span className="text-[#22201C] font-medium">Chi tiết đơn</span>
          </div>
        }
      >
        <div className="py-24 text-center text-[#666666] text-[14px]">
          Đang tải chi tiết đơn...
        </div>
      </AdminLayout>
    );
  }

  const isUnconfirmed = order.status === "Chưa xác nhận thanh toán";

  return (
    <AdminLayout
      title="Quản lý gọi món"
      showBackButton={true}
      onBackClick={() => navigate("/admin/orders")}
      noMainPadding={true}
      breadcrumb={
        <div className="flex items-center space-x-1.5 text-[14px]">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="text-[#D1342C] hover:underline cursor-pointer"
          >
            Danh sách đơn
          </button>
          <span className="text-[#666666]">&gt;&gt;</span>
          <span className="text-[#22201C] font-medium">Chi tiết đơn</span>
        </div>
      }
    >
      <div className="px-[16px] pt-4">
        {/* Mã đơn */}
        <p className="text-[14px] text-[#666666] font-normal leading-tight">
          Đơn #{order.id}
        </p>

        {/* Số bàn */}
        <h2 className="text-[24px] font-bold text-[#D1342C] mt-0.5 mb-2.5 leading-none">
          Bàn {order.tableNumber}
        </h2>

        {/* Nhãn trạng thái đơn 1 dòng chuẩn Figma */}
        <div className="mb-4">
          {isUnconfirmed ? (
            <span className="inline-block bg-[#FBEBD3] text-[#5C3A0E] px-3.5 py-1 rounded-full text-[12px] font-medium">
              Chưa xác nhận thanh toán
            </span>
          ) : (
            <span className="inline-block bg-[#D1EAE2] text-[#1E5642] px-3.5 py-1 rounded-full text-[12px] font-medium">
              Đã xác nhận thanh toán
            </span>
          )}
        </div>

        {/* Bảng chi tiết món đã gọi (Card trắng) */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm border border-[#E8E0D2] mb-5">
          {/* Header card: Món đã gọi & Ngày giờ */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
            <span className="text-[#D1342C] font-bold text-[16px]">
              Món đã gọi
            </span>
            <span className="text-[#22201C] text-[13px] font-medium">
              {order.date} • {order.time}
            </span>
          </div>

          {/* Tiêu đề các cột */}
          <div className="grid grid-cols-12 text-[13px] text-[#777777] font-normal mt-3 mb-1">
            <span className="col-span-6">Tên món / Đơn giá</span>
            <span className="col-span-2 text-center">SL</span>
            <span className="col-span-4 text-right">Thành tiền</span>
          </div>

          {/* Danh sách từng món */}
          <div className="divide-y divide-[#F6EFE6]/60">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-start py-2.5 text-[14px]"
              >
                <div className="col-span-6 pr-1">
                  <p className="font-bold text-[15px] text-[#22201C] leading-snug">
                    {item.name}
                  </p>
                  <p className="text-[13px] text-[#777777] mt-0.5">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="col-span-2 text-center text-[15px] font-medium text-[#22201C] pt-0.5">
                  {item.quantity}
                </div>
                <div className="col-span-4 text-right text-[15px] font-bold text-[#22201C] pt-0.5">
                  {formatCurrency(item.total)}
                </div>
              </div>
            ))}
          </div>

          {/* Dòng Tổng tiền */}
          <div className="pt-3 mt-1 flex items-center justify-between">
            <span className="font-bold text-[16px] text-[#22201C]">
              Tổng tiền
            </span>
            <span
              className={`font-bold text-[16px] ${
                isUnconfirmed ? "text-[#D1342C]" : "text-[#22201C]"
              }`}
            >
              {formatCurrency(order.total)}
            </span>
          </div>

          {/* Dòng Thanh toán */}
          <div className="pt-2 flex items-center justify-between text-[14px]">
            <span className="text-[#777777]">Thanh toán</span>
            <span className="font-medium text-[#22201C]">
              {order.paymentMethod}
            </span>
          </div>

          {/* Dòng Ghi chú */}
          <div className="pt-2 flex items-start justify-between text-[14px]">
            <span className="text-[#777777] flex-shrink-0 mr-3">Ghi chú</span>
            <span className="font-medium text-[#22201C] text-right">
              {order.note || "Không có ghi chú"}
            </span>
          </div>
        </div>

        {/* Các nút hành động phía dưới */}
        {isUnconfirmed ? (
          /* Đơn chưa xác nhận: hiện cả 2 nút (Xác nhận đã nhận tiền + Xóa đơn) */
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmPaymentOpen(true)}
              className="flex-1 h-[48px] rounded-[14px] bg-[#2F5D50] text-white font-bold text-[15px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm"
            >
              Xác nhận đã nhận tiền
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-[110px] h-[48px] rounded-[14px] bg-[#8A2424] text-white font-bold text-[15px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm"
            >
              Xóa đơn
            </button>
          </div>
        ) : (
          /* Đơn đã xác nhận: chỉ hiện nút Xóa đơn bên phải (BR-UC2-03) */
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-[130px] h-[48px] rounded-[14px] bg-[#8A2424] text-white font-bold text-[15px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm"
            >
              Xóa đơn
            </button>
          </div>
        )}
      </div>

      {/* Modal xác nhận đã nhận tiền chuẩn UC 2.1 */}
      <ModalActionDialog
        isOpen={isConfirmPaymentOpen}
        question="Bạn đã nhận đủ tiền của đơn này chưa?"
        cancelText="Không"
        confirmText="Có"
        onCancel={() => setIsConfirmPaymentOpen(false)}
        onConfirm={handleConfirmPayment}
      />

      {/* Modal xác nhận xóa đơn chuẩn UC 2.3 */}
      <ModalActionDialog
        isOpen={isDeleteDialogOpen}
        question="Bạn có chắc chắn muốn xóa đơn này không?"
        cancelText="Hủy"
        confirmText="Xóa"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteOrder}
      />

      {/* Modal thông báo kết quả (Xác nhận thành công / Đã xóa đơn / Lỗi) */}
      <ModalConfirm
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => {
          setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
          if (feedbackModal.onAfterClose) {
            feedbackModal.onAfterClose();
          }
        }}
      />
    </AdminLayout>
  );
};
