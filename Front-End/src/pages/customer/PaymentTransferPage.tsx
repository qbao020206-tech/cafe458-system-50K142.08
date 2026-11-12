import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerLayout } from "../../components/layout/CustomerLayout";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { createOrder, previewOrder } from "../../services/orderService";
import { OrderPreviewResponse } from "../../types/order";
import { BANK_CONFIG } from "../../constants/bank";

export const PaymentTransferPage: React.FC = () => {
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
  const [previewData, setPreviewData] = useState<OrderPreviewResponse | null>(null);

  useEffect(() => {
    if (totalQuantity === 0 && !successModalOpen) {
      navigate(qrCode ? `/menu?qr=${qrCode}` : "/menu");
    }
  }, [totalQuantity, successModalOpen, navigate, qrCode]);

  useEffect(() => {
    if (totalQuantity === 0) return;
    const fetchPreview = async () => {
      try {
        const data = await previewOrder({
          qr: qrCode,
          qr_token: qrCode,
          items: items.map((i) => ({
            ma_mon: i.dish.ma_mon,
            so_luong: i.quantity,
          })),
          phuong_thuc_thanh_toan: "Chuyển khoản",
        });
        setPreviewData(data);
      } catch {
        // Fallback sang tính toán local
      }
    };
    fetchPreview();
  }, [qrCode, items, totalQuantity]);

  const rawTable = previewData?.so_ban || tableNumber || "03";
  const effectiveTable = rawTable.replace(/^Bàn\s*/i, "").trim() || rawTable;
  const displayAmount = previewData?.total_amount ?? totalAmount;
  const transferContent = `BAN ${effectiveTable}`;

  // Sử dụng QR URL Base64 trực tiếp từ Back-End preview
  const qrUrl = previewData?.payment_qr_url || "";

  const handleComplete = async () => {
    if (totalQuantity === 0) return;

    try {
      setLoading(true);
      await createOrder({
        qr: qrCode,
        qr_token: qrCode,
        items: items.map((i) => ({
          ma_mon: i.dish.ma_mon,
          so_luong: i.quantity,
        })),
        phuong_thuc_thanh_toan: "Chuyển khoản",
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
        <div className="px-[20px] pb-8">
          {/* Nhãn bàn */}
          <p className="font-bold text-[#D1342C] text-[20px] mb-[14px]">
            Bàn {effectiveTable} · Chuyển khoản
          </p>

          {/* Khung thanh toán chuyển khoản chuẩn Figma */}
          <div className="bg-white rounded-[14px] border border-[#E8E0D2] p-5 shadow-sm flex flex-col items-center">
            <h2 className="font-bold text-[16px] text-[#22201C] mb-3">
              Quét mã QR để chuyển khoản
            </h2>

            <div className="w-[180px] h-[180px] flex items-center justify-center mb-1">
              <img
                src={qrUrl}
                alt="Mã QR Chuyển khoản"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-[26px] font-bold text-[#D1342C] my-2">
              {formatCurrency(displayAmount)}
            </div>

            <div className="w-full space-y-2 text-[14px] text-[#666666] pt-1">
              <div className="flex justify-between items-center">
                <span>Ngân hàng</span>
                <span className="font-bold text-[#22201C]">
                  {BANK_CONFIG.BANK_NAME}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Số tài khoản</span>
                <span className="font-bold text-[#22201C]">
                  {BANK_CONFIG.BANK_ACCOUNT_NO}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Chủ tài khoản</span>
                <span className="font-bold text-[#22201C]">
                  {BANK_CONFIG.BANK_ACCOUNT_NAME}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Nội dung</span>
                <span className="font-bold text-[#22201C]">
                  {transferContent}
                </span>
              </div>
            </div>
          </div>

          {/* Nút Hoàn tất */}
          <button
            type="button"
            onClick={handleComplete}
            disabled={loading || totalQuantity === 0}
            className="w-full bg-[#2F5D50] hover:bg-[#254b40] disabled:opacity-50 text-white font-bold h-[48px] px-[24px] rounded-[14px] text-[16px] mt-4 mb-2 active:scale-95 transition-all shadow-none flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Hoàn tất</span>
            )}
          </button>

          {/* Lời nhắc chụp lại giao dịch */}
          <div className="text-[13px] text-[#666666] text-center leading-relaxed">
            <p>{previewData?.payment_message || "Sau khi chuyển khoản, nhấn Hoàn tất. Vui lòng chụp lại giao dịch để đối chiếu khi cần thiết"}</p>
          </div>
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
