import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerLayout } from "../../components/layout/CustomerLayout";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { createOrder } from "../../services/orderService";

export const PaymentCashPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    qrCode,
    tableNumber,
    items,
    note,
    totalQuantity,
    totalAmount,
    clearCart,
  } = useCart();

  const [loading, setLoading] = useState<boolean>(false);
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (totalQuantity === 0 && !successModalOpen) {
      navigate(qrCode ? `/menu?qr=${qrCode}` : "/menu");
    }
  }, [totalQuantity, successModalOpen, navigate, qrCode]);

  const effectiveTable = tableNumber || "03";

  const handleComplete = async () => {
    if (totalQuantity === 0) return;

    try {
      setLoading(true);
      await createOrder({
        qr_code: qrCode || "ban03",
        items: items.map((i) => ({
          ma_mon: i.dish.ma_mon,
          so_luong: i.quantity,
        })),
        phuong_thuc_thanh_toan: "Tiền mặt",
        ghi_chu: note.trim() || null,
      });

      setSuccessModalOpen(true);
    } catch {
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    clearCart();
    navigate(qrCode ? `/menu?qr=${qrCode}` : "/menu");
  };

  return (
    <CustomerLayout
      title={successModalOpen ? "Menu" : "Thanh toán"}
      showBackButton={!successModalOpen}
      onBackClick={() => navigate("/checkout")}
    >
      {/* Khi mở modal thành công hoặc lỗi, ẩn toàn bộ nội dung phía sau để trống trơn 100% khớp Figma */}
      {!successModalOpen && !errorModalOpen && (
        <div className="px-[20px] pb-8 space-y-4">
          {/* Nhãn bàn */}
          <p className="font-bold text-[#D1342C] text-[20px]">
            Bàn {effectiveTable} · Tiền mặt
          </p>

          {/* Ô số liệu tổng tiền */}
          <div className="bg-white border border-[#E8E0D2] flex items-center justify-between px-[14px] py-[12px] rounded-[14px] text-[#22201C] text-[16px]">
            <p className="font-normal">Tổng tiền</p>
            <p className="font-bold">{formatCurrency(totalAmount)}</p>
          </div>

          {/* Thông báo lưu ý */}
          <div className="bg-[#FBEBD3] flex flex-col items-center justify-center p-[16px] rounded-[12px]">
            <p className="font-bold text-[#5C3A0E] text-[16px] text-center w-full">
              Chờ thu tiền sau khi bưng nước ra
            </p>
          </div>

          {/* Nút Hoàn tất */}
          <button
            type="button"
            onClick={handleComplete}
            disabled={loading || totalQuantity === 0}
            className="w-full bg-[#2F5D50] hover:bg-[#254b40] disabled:opacity-50 text-white font-bold h-[48px] px-[24px] py-[14px] rounded-[14px] text-[16px] active:scale-95 transition-all shadow-none flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Hoàn tất</span>
            )}
          </button>
        </div>
      )}

      {/* Modal Đặt món thành công */}
      <ModalConfirm
        isOpen={successModalOpen}
        type="success"
        message="Đặt món thành công"
        onClose={handleSuccessClose}
      />

      {/* Modal Đặt món không thành công */}
      <ModalConfirm
        isOpen={errorModalOpen}
        type="error"
        message={"Đặt món không thành công,\nvui lòng thử lại!"}
        onClose={() => setErrorModalOpen(false)}
      />
    </CustomerLayout>
  );
};
