import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerLayout } from "../../components/layout/CustomerLayout";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { MESSAGES } from "../../constants/messages";
import { CartItem } from "../../types/order";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    qrCode,
    tableNumber,
    items,
    updateQuantity,
    note,
    setNote,
    paymentMethod,
    setPaymentMethod,
    totalQuantity,
    totalAmount,
  } = useCart();

  const [step, setStep] = useState<"review" | "select_payment">("review");
  const [showZeroAlert, setShowZeroAlert] = useState<boolean>(false);

  useEffect(() => {
    if (totalQuantity === 0) {
      setShowZeroAlert(true);
    }
  }, [totalQuantity]);

  const handleNextStep = () => {
    if (totalQuantity === 0) {
      setShowZeroAlert(true);
      return;
    }
    if (step === "review") {
      setStep("select_payment");
    } else {
      if (paymentMethod === "Chuyển khoản") {
        navigate("/payment-transfer");
      } else {
        navigate("/payment-cash");
      }
    }
  };

  const handleBack = () => {
    if (step === "select_payment") {
      setStep("review");
    } else {
      const target = qrCode ? `/menu?qr=${qrCode}` : "/menu";
      navigate(target);
    }
  };

  const handleZeroAlertClose = () => {
    setShowZeroAlert(false);
    if (totalQuantity === 0) {
      const target = qrCode ? `/menu?qr=${qrCode}` : "/menu";
      navigate(target);
    }
  };

  return (
    <CustomerLayout title="Thanh toán" showBackButton onBackClick={handleBack}>
      <div className="px-[20px] pb-28">
        {/* Nhãn bàn */}
        <div className="text-[#D1342C] font-bold text-[20px] mb-[14px]">
          Bàn {tableNumber || "03"}
        </div>

        {step === "review" ? (
          <div className="space-y-4">
            <section>
              <h2 className="text-[16px] font-bold text-[#22201C] mb-[12px]">
                Đơn của bạn
              </h2>
              <div className="space-y-2.5">
                {items.map((item: CartItem) => (
                  <div
                    key={item.dish.ma_mon}
                    className="bg-white rounded-[14px] border border-[#E8E0D2] px-[14px] py-[12px] flex items-center justify-between text-[16px]"
                  >
                    <div className="flex items-center">
                      <span className="font-bold text-[15px] text-[#22201C] mr-3">
                        {item.dish.ten_mon}
                      </span>
                      <span className="text-[14px] text-[#666666]">
                        {formatCurrency(item.dish.gia_ban)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.dish.ma_mon, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-full border border-[#2F5D50] text-[#2F5D50] flex items-center justify-center font-normal text-lg active:scale-95 transition-transform bg-transparent cursor-pointer"
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="text-[15px] font-bold text-[#22201C] w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.dish.ma_mon, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full bg-[#2F5D50] text-white flex items-center justify-center font-normal text-lg active:scale-95 transition-transform cursor-pointer"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2">
                <span className="text-[16px] font-bold text-[#22201C]">
                  Ghi chú
                </span>
                <span className="text-[14px] font-normal text-[#666666] ml-1.5">
                  (không bắt buộc)
                </span>
              </div>
              <div className="bg-white rounded-[14px] border border-[#E8E0D2] p-[14px]">
                <textarea
                  id="order-note"
                  rows={3}
                  maxLength={200}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={MESSAGES.NOTE_PLACEHOLDER}
                  className="w-full text-[14px] text-[#22201C] placeholder-[#999999] focus:outline-none resize-none bg-transparent"
                />
                <div className="text-right text-[12px] text-[#999999] mt-1">
                  {note.length}/200
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            <section>
              <h2 className="text-[16px] font-bold text-[#22201C] mb-[12px]">
                Đơn của bạn
              </h2>
              <div className="space-y-2.5">
                {items.map((item: CartItem) => (
                  <div
                    key={item.dish.ma_mon}
                    className="bg-white rounded-[14px] border border-[#E8E0D2] px-[14px] py-[12px] flex justify-between items-center text-[16px]"
                  >
                    <span className="font-normal text-[#22201C]">
                      {item.dish.ten_mon} x{item.quantity}
                    </span>
                    <span className="font-bold text-[#22201C]">
                      {formatCurrency(item.dish.gia_ban * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="bg-white rounded-[14px] border border-[#E8E0D2] px-[14px] py-[12px] flex justify-between items-center text-[16px]">
                  <span className="font-normal text-[#22201C]">Tổng tiền</span>
                  <span className="font-bold text-[#D1342C]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[16px] font-bold text-[#22201C] mt-5 mb-[12px]">
                Phương thức thanh toán
              </h2>
              <div className="space-y-2.5">
                <div
                  onClick={() => setPaymentMethod("Chuyển khoản")}
                  className="bg-white rounded-[14px] border border-[#E8E0D2] p-[14px] flex items-center space-x-3 cursor-pointer transition-all"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
                    {paymentMethod === "Chuyển khoản" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2F5D50]" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-[#22201C]">
                      Chuyển khoản
                    </p>
                    <p className="text-[13px] text-[#666666] mt-0.5">
                      Quét mã QR ngân hàng
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("Tiền mặt")}
                  className="bg-white rounded-[14px] border border-[#E8E0D2] p-[14px] flex items-center space-x-3 cursor-pointer transition-all"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
                    {paymentMethod === "Tiền mặt" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2F5D50]" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-[#22201C]">
                      Tiền mặt
                    </p>
                    <p className="text-[13px] text-[#666666] mt-0.5">
                      Trả tiền khi nhận món tại bàn
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Thanh giỏ hàng / Tiếp tục ở đáy */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[390px] h-[84px] mx-auto bg-white border-t border-[#E8E0D2] px-[20px] flex items-center justify-between z-40 shadow-sm">
        <div>
          <span className="text-[13px] text-[#666666] block leading-tight">
            {totalQuantity} món
          </span>
          <span className="text-[20px] font-bold text-[#D1342C] block leading-tight mt-0.5">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleNextStep}
          className="bg-[#2F5D50] hover:bg-[#254b40] text-white font-bold h-[48px] px-[24px] rounded-[14px] text-[16px] active:scale-95 transition-all shadow-none flex items-center justify-center cursor-pointer"
        >
          Tiếp tục
        </button>
      </div>

      <ModalConfirm
        isOpen={showZeroAlert}
        type="error"
        message={MESSAGES.ORDER_MIN_ONE}
        onClose={handleZeroAlertClose}
      />
    </CustomerLayout>
  );
};
