import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CustomerLayout } from "../../components/layout/CustomerLayout";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { useCart } from "../../contexts/CartContext";
import { getMenuByQr } from "../../services/menuService";
import { Dish, RecommendedDish } from "../../types/menu";
import { formatCurrency } from "../../utils/formatCurrency";
import { MESSAGES } from "../../constants/messages";

export const MenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qrParam = searchParams.get("qr") || "";

  const {
    setTableSession,
    tableNumber,
    items,
    addItem,
    updateQuantity,
    totalQuantity,
    totalAmount,
  } = useCart();

  const [recommendedDishes, setRecommendedDishes] = useState<RecommendedDish[]>(
    [],
  );
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQrInvalid, setIsQrInvalid] = useState<boolean>(false);
  const [showZeroAlert, setShowZeroAlert] = useState<boolean>(false);

  useEffect(() => {
    const effectiveQr = qrParam || "ban03";

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        setIsQrInvalid(false);
        const data = await getMenuByQr(effectiveQr);
        setTableSession(effectiveQr, data.so_ban);
        setRecommendedDishes(data.mon_de_cu || []);
        setAllDishes(data.tat_ca_mon || []);
      } catch (err: any) {
        if (
          err?.isQrInvalid ||
          err?.response?.status === 404 ||
          err?.response?.data?.error?.code === "QR_INVALID" ||
          effectiveQr === "invalid"
        ) {
          setIsQrInvalid(true);
        } else {
          setErrorMessage(MESSAGES.MENU_LOAD_ERROR);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [qrParam]);

  const getItemQuantity = (maMon: number): number => {
    const item = items.find((i) => i.dish.ma_mon === maMon);
    return item ? item.quantity : 0;
  };

  const handleContinue = () => {
    if (totalQuantity === 0) {
      setShowZeroAlert(true);
      return;
    }
    navigate("/checkout");
  };

  if (isQrInvalid) {
    return (
      <CustomerLayout title="Menu">
        <div className="flex flex-col items-center justify-center py-28 text-gray-500">
          <ModalConfirm
            isOpen={true}
            type="error"
            message={MESSAGES.QR_INVALID}
          />
        </div>
      </CustomerLayout>
    );
  }

  if (errorMessage) {
    return (
      <CustomerLayout title="Menu">
        <div className="text-[#C22222] font-bold text-lg mb-2">
          Bàn {tableNumber || "--"}
        </div>
        <ModalConfirm
          isOpen={true}
          type="error"
          message={errorMessage}
          onClose={() => window.location.reload()}
        />
      </CustomerLayout>
    );
  }

  if (loading) {
    return (
      <CustomerLayout title="Menu">
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-8 h-8 border-4 border-[#C22222] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Đang tải menu...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (allDishes.length === 0) {
    return (
      <CustomerLayout title="Menu">
        <div className="text-[#C22222] font-bold text-lg mb-6">
          Bàn {tableNumber || "03"}
        </div>
        <div className="flex flex-col items-center justify-center py-28 text-gray-500">
          <svg
            className="w-16 h-16 text-gray-400 mb-3 stroke-[1.5]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"
            />
          </svg>
          <p className="text-sm font-medium">{MESSAGES.MENU_EMPTY}</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="Menu">
      <div className="pb-24">
        <div className="text-[#C22222] font-bold text-lg mb-3">
          Bàn {tableNumber || "03"}
        </div>

        {recommendedDishes.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Món đề cử
            </h2>
            <div className="grid grid-cols-3 gap-2.5">
              {recommendedDishes.slice(0, 3).map((dish) => {
                const qty = getItemQuantity(dish.ma_mon);
                return (
                  <div
                    key={`rec-${dish.ma_mon}`}
                    onClick={() => addItem(dish)}
                    className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-all relative group"
                  >
                    <div className="relative w-full aspect-square bg-[#E8E4DD] rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      <span className="absolute top-1 left-1 bg-[#F5EDE0] text-[#8C6D3B] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                        Top {dish.rank}
                      </span>
                      {qty > 0 && (
                        <span className="absolute top-1 right-1 bg-[#235D4B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-10">
                          {qty}
                        </span>
                      )}
                      {dish.hinh_anh ? (
                        <img
                          src={dish.hinh_anh}
                          alt={dish.ten_mon}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl opacity-60">☕</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-gray-900 line-clamp-1">
                        {dish.ten_mon}
                      </h3>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-gray-600 font-medium">
                          {formatCurrency(dish.gia_ban)}
                        </p>
                        <span className="text-xs font-bold text-[#235D4B] bg-[#235D4B]/10 rounded-full w-5 h-5 flex items-center justify-center">
                          +
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">Tất cả món</h2>
          {allDishes.map((dish) => {
            const qty = getItemQuantity(dish.ma_mon);
            return (
              <div
                key={dish.ma_mon}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                  <div className="w-16 h-16 bg-[#E8E4DD] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden text-2xl">
                    {dish.hinh_anh ? (
                      <img
                        src={dish.hinh_anh}
                        alt={dish.ten_mon}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="opacity-60">☕</span>
                    )}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-sm text-gray-900 truncate">
                      {dish.ten_mon}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">
                      {formatCurrency(dish.gia_ban)}
                    </p>
                  </div>
                </div>

                {qty > 0 ? (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(dish.ma_mon, qty - 1)}
                      className="w-7 h-7 rounded-full border border-gray-400 text-gray-700 flex items-center justify-center font-bold active:scale-95 transition-transform"
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold w-4 text-center">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(dish.ma_mon, qty + 1)}
                      className="w-7 h-7 rounded-full bg-[#235D4B] text-white flex items-center justify-center font-bold active:scale-95 transition-transform"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addItem(dish)}
                    className="w-8 h-8 rounded-full bg-[#235D4B] text-white flex items-center justify-center font-bold shadow-sm active:scale-95 transition-transform"
                    aria-label="Thêm món"
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </section>
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
          onClick={handleContinue}
          className="bg-[#235D4B] hover:bg-[#1B4739] text-white font-bold px-6 py-2.5 rounded-lg active:scale-95 transition-all text-sm tracking-wide shadow-sm"
        >
          Tiếp tục
        </button>
      </div>

      <ModalConfirm
        isOpen={showZeroAlert}
        type="error"
        message={MESSAGES.ORDER_MIN_ONE}
        onClose={() => setShowZeroAlert(false)}
      />
    </CustomerLayout>
  );
};
