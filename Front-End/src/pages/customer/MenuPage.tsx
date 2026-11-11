import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CustomerLayout } from "../../components/layout/CustomerLayout";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { CoffeeCupIcon } from "../../components/common/CoffeeCupIcon";
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
        <ModalConfirm
          isOpen={true}
          type="error"
          message={MESSAGES.QR_INVALID}
        />
      </CustomerLayout>
    );
  }

  if (errorMessage) {
    return (
      <CustomerLayout title="Menu">
        <div className="px-[22px] text-[#D1342C] font-bold text-[20px] mb-[14px]">
          Bàn {tableNumber || "03"}
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
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <div className="w-8 h-8 border-3 border-[#D1342C] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Đang tải menu...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (allDishes.length === 0) {
    return (
      <CustomerLayout title="Menu">
        <div className="px-[22px] text-[#D1342C] font-bold text-[20px] mb-[14px]">
          Bàn {tableNumber || "03"}
        </div>
        <div className="flex flex-col items-center justify-center py-36">
          <CoffeeCupIcon className="w-14 h-14 text-[#7D7265] mb-4" />
          <p className="text-[16px] text-[#666666]">{MESSAGES.MENU_EMPTY}</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="Menu">
      <div className="pb-28">
        {/* Nhãn bàn x: 22, y: 115 */}
        <div className="px-[22px] text-[#D1342C] font-bold text-[20px] mb-[12px]">
          Bàn {tableNumber || "03"}
        </div>

        {/* Khi hiện popup lỗi chưa chọn món (showZeroAlert), ẩn toàn bộ danh sách món phía sau khớp 100% Figma */}
        {!showZeroAlert && (
          <>
            {/* Mục Món bán chạy / Món đề cử: x: 17, y: 149 */}
            {recommendedDishes.length > 0 && (
              <section className="mb-6">
                <h2 className="px-[17px] text-[16px] font-bold text-[#22201C] mb-[10px]">
                  Món đề cử
                </h2>
                {/* Dãy thẻ món bán chạy chuẩn Figma: W 125, H 160, gap 6px */}
                <div className="px-[3px] flex gap-[6px] justify-start">
                  {recommendedDishes.slice(0, 3).map((dish) => (
                    <div
                      key={`rec-${dish.ma_mon}`}
                      className="w-[125px] h-[160px] bg-white rounded-[14px] border border-[#E8E0D2] relative p-0 flex flex-col flex-shrink-0 shadow-sm"
                    >
                      {/* Ảnh món chuẩn Figma: W 121, H 89, cách mép trên 5px */}
                      <div className="w-[121px] h-[89px] mx-auto mt-[5px] bg-[#E5DFD5] rounded-[10px] relative flex items-center justify-center overflow-hidden flex-shrink-0">
                        <span className="absolute top-[6px] left-[6px] bg-[#F5EEDB] text-[#7A4B1A] text-[10px] font-bold px-[8px] py-[2px] rounded-full z-10">
                          Top {dish.rank}
                        </span>
                        {dish.hinh_anh ? (
                          <img
                            src={dish.hinh_anh}
                            alt={dish.ten_mon}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CoffeeCupIcon className="w-[38px] h-[38px] text-[#7D7265]" />
                        )}
                      </div>
                      {/* Tên món và giá */}
                      <div className="px-[8px] pt-[7px]">
                        <h3 className="font-bold text-[14px] text-[#22201C] truncate leading-tight">
                          {dish.ten_mon}
                        </h3>
                        <p className="text-[13px] text-[#666666] mt-1 leading-tight">
                          {formatCurrency(dish.gia_ban)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Mục Tất cả món: x: 22, y: 368 */}
            <section>
              <h2 className="px-[22px] text-[16px] font-bold text-[#22201C] mb-[12px]">
                Tất cả món
              </h2>
              <div className="px-[3px] space-y-[6px]">
                {allDishes.map((dish) => {
                  const qty = getItemQuantity(dish.ma_mon);
                  return (
                    <div
                      key={dish.ma_mon}
                      className="w-[384px] h-[101px] bg-white rounded-[14px] border border-[#E8E0D2] p-[7px] flex items-center justify-between shadow-sm"
                    >
                      {/* Thumbnail món chuẩn Figma: W 110, H 88 */}
                      <div className="w-[110px] h-[88px] bg-[#E5DFD5] rounded-[10px] flex items-center justify-center flex-shrink-0 mr-3 overflow-hidden">
                        {dish.hinh_anh ? (
                          <img
                            src={dish.hinh_anh}
                            alt={dish.ten_mon}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CoffeeCupIcon className="w-[38px] h-[38px] text-[#7D7265]" />
                        )}
                      </div>

                      {/* Thông tin tên và giá */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold text-[15px] text-[#22201C] truncate leading-tight">
                          {dish.ten_mon}
                        </h3>
                        <p className="text-[13px] text-[#666666] mt-1 leading-tight">
                          {formatCurrency(dish.gia_ban)}
                        </p>
                      </div>

                      {/* Nút cộng / trừ chuẩn Figma */}
                      {qty > 0 ? (
                        <div className="flex items-center space-x-2 pr-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(dish.ma_mon, qty - 1)}
                            className="w-[32px] h-[32px] rounded-full border border-[#2F5D50] text-[#2F5D50] flex items-center justify-center font-normal text-xl active:scale-95 transition-transform bg-transparent cursor-pointer"
                            aria-label="Giảm số lượng"
                          >
                            −
                          </button>
                          <span className="text-[15px] font-bold text-[#22201C] w-[24px] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(dish.ma_mon, qty + 1)}
                            className="w-[32px] h-[32px] rounded-full bg-[#2F5D50] text-white flex items-center justify-center font-normal text-xl active:scale-95 transition-transform cursor-pointer"
                            aria-label="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="pr-1">
                          <button
                            type="button"
                            onClick={() => addItem(dish)}
                            className="w-[36px] h-[36px] rounded-full bg-[#2F5D50] text-white flex items-center justify-center font-normal text-xl active:scale-95 transition-transform cursor-pointer"
                            aria-label="Thêm món"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Thanh giỏ hàng ở đáy: cao 84px, px-5 */}
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
          onClick={handleContinue}
          className="bg-[#2F5D50] hover:bg-[#254b40] text-white font-bold h-[48px] px-[24px] rounded-[14px] text-[16px] active:scale-95 transition-all shadow-none flex items-center justify-center cursor-pointer"
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
