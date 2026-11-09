import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerLayout } from "../../components/layout/CustomerLayout";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { MESSAGES } from "../../constants/messages";
import { PaymentMethod, CartItem } from "../../types/order";

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

  // QĐ-25: Nếu giỏ hàng rỗng khi vào Checkout hoặc khi giảm hết món, cảnh báo và điều hướng về Menu
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
      <div className="pb-24">
        <div className="text-[#C22222] font-bold text-lg mb-3">
          Bàn {tableNumber || "03"}
        </div>

        {step === "review" ? (
          <div className="space-y-4">
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">
                Đơn của bạn
              </h2>
              <div className="space-y-2">
                {items.map((item: CartItem) => (
                  <div
                    key={item.dish.ma_mon}
                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">
                        {item.dish.ten_mon}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {formatCurrency(item.dish.gia_ban)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.dish.ma_mon, item.quantity - 1)
                        }
                        className="w-7 h-7 rounded-full border border-gray-400 text-gray-700 flex items-center justify-center font-bold active:scale-95 transition-transform"
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.dish.ma_mon, item.quantity + 1)
                        }
                        className="w-7 h-7 rounded-full bg-[#235D4B] text-white flex items-center justify-center font-bold active:scale-95 transition-transform"
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
              <label
                htmlFor="order-note"
                className="block text-sm font-bold text-gray-900 mb-1"
              >
                Ghi chú{" "}
                <span className="font-normal text-gray-500">
                  (không bắt buộc)
                </span>
              </label>
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <textarea
                  id="order-note"
                  rows={3}
                  maxLength={200}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={MESSAGES.NOTE_PLACEHOLDER}
                  className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none bg-transparent"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {note.length}/200
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">
                Đơn của bạn
              </h2>
              <div className="space-y-2">
                {items.map((item: CartItem) => (
                  <div
                    key={item.dish.ma_mon}
                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-gray-900">
                      {item.dish.ten_mon} x{item.quantity}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(item.dish.gia_ban * item.quantity)}
                    </span>
                  </div>
                ))}

                {note.trim() && (
                  <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-200/50 text-xs text-gray-700">
                    <span className="font-semibold text-gray-900">Ghi chú:</span>{" "}
                    {note}
                  </div>
                )}

                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">Tổng tiền</span>
                  <span className="font-bold text-[#C22222]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">
                Phương thức thanh toán
              </h2>
              <div className="space-y-2.5">
                <div
                  onClick={() => setPaymentMethod("Chuyển khoản")}
                  className={`bg-white rounded-xl p-3.5 shadow-sm border flex items-center space-x-3 cursor-pointer transition-all ${
                    paymentMethod === "Chuyển khoản"
                      ? "border-[#235D4B] ring-1 ring-[#235D4B]"
                      : "border-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    id="pay-transfer"
                    name="payment_method"
                    value="Chuyển khoản"
                    checked={paymentMethod === "Chuyển khoản"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="w-4 h-4 text-[#235D4B] focus:ring-[#235D4B]"
                  />
                  <label htmlFor="pay-transfer" className="cursor-pointer">
                    <p className="font-bold text-sm text-gray-900">
                      Chuyển khoản
                    </p>
                    <p className="text-xs text-gray-500">Quét mã QR ngân hàng</p>
                  </label>
                </div>

                <div
                  onClick={() => setPaymentMethod("Tiền mặt")}
                  className={`bg-white rounded-xl p-3.5 shadow-sm border flex items-center space-x-3 cursor-pointer transition-all ${
                    paymentMethod === "Tiền mặt"
                      ? "border-[#235D4B] ring-1 ring-[#235D4B]"
                      : "border-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    id="pay-cash"
                    name="payment_method"
                    value="Tiền mặt"
                    checked={paymentMethod === "Tiền mặt"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="w-4 h-4 text-[#235D4B] focus:ring-[#235D4B]"
                  />
                  <label htmlFor="pay-cash" className="cursor-pointer">
                    <p className="font-bold text-sm text-gray-900">Tiền mặt</p>
                    <p className="text-xs text-gray-500">
                      Trả tiền khi nhận món tại bàn
                    </p>
                  </label>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between z-40 shadow-lg">
        <div>
          <p className="text-xs text-gray-500 font-medium">
            {totalQuantity} món
          </p>
          <p className="text-lg font-bold text-[#C22222]">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleNextStep}
          className="bg-[#235D4B] hover:bg-[#1B4739] text-white font-bold px-6 py-2.5 rounded-lg active:scale-95 transition-all text-sm tracking-wide shadow-sm"
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
