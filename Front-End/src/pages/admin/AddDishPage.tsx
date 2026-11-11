import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { addAdminDish } from "../../services/adminMenuService";
import { CoffeeCupIcon } from "../../components/common/CoffeeCupIcon";
import { ModalConfirm } from "../../components/common/ModalConfirm";

export const AddDishPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dishName, setDishName] = useState<string>("");
  const [dishPrice, setDishPrice] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Lỗi trường nhập liệu
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setPriceError(null);
    setSystemError(null);

    const trimmedName = dishName.trim();
    const trimmedPrice = dishPrice.trim();

    let hasError = false;

    // Kiểm tra tên món (BR-UC3-02)
    if (!trimmedName) {
      setNameError("Không được để trống!");
      hasError = true;
    }

    // Kiểm tra giá bán (BR-UC3-02 & BR-UC3-04)
    if (!trimmedPrice) {
      setPriceError("Không được để trống!");
      hasError = true;
    } else {
      const numPrice = Number(trimmedPrice.replace(/\./g, "").replace(/,/g, ""));
      if (isNaN(numPrice) || numPrice <= 0) {
        setPriceError("Giá bán phải là số lớn hơn 0!");
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      const numPrice = Number(trimmedPrice.replace(/\./g, "").replace(/,/g, ""));
      await addAdminDish({
        ten_mon: trimmedName,
        gia_ban: numPrice,
        hinh_anh: imagePreview,
      });

      // Điều hướng về màn hình Danh sách món kèm thông báo thành công (Bảng 76)
      navigate("/admin/menu", {
        replace: true,
        state: { successMessage: "Thêm món thành công" },
      });
    } catch (err: any) {
      if (err?.field === "ten_mon") {
        setNameError(err.message);
      } else if (err?.field === "gia_ban") {
        setPriceError(err.message);
      } else {
        setSystemError("Có lỗi xảy ra, vui lòng thử lại!");
      }
    }
  };

  return (
    <AdminLayout
      title="Quản lý menu"
      showBackButton={true}
      onBackClick={() => navigate("/admin/menu")}
      noMainPadding={true}
      breadcrumb={
        <div className="flex items-center space-x-1.5 text-[14px]">
          <button
            type="button"
            onClick={() => navigate("/admin/menu")}
            className="text-[#D1342C] hover:underline cursor-pointer"
          >
            Quản lý menu
          </button>
          <span className="text-[#666666]">&gt;&gt;</span>
          <span className="text-[#22201C] font-bold">Thêm món</span>
        </div>
      }
    >
      <div className="px-[16px] pt-4 pb-8">
        <form onSubmit={handleSubmit}>
          {/* Trường Tên món */}
          <div className="mb-4">
            <label
              htmlFor="dishNameInput"
              className="block font-bold text-[16px] text-[#22201C] mb-2"
            >
              Tên món
            </label>
            <input
              id="dishNameInput"
              type="text"
              value={dishName}
              onChange={(e) => {
                setDishName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="Nhập tên món"
              className={`w-full h-[48px] px-3.5 rounded-[14px] bg-white text-[15px] text-[#22201C] focus:outline-none transition-colors ${
                nameError
                  ? "border-2 border-[#D1342C] focus:border-[#D1342C]"
                  : "border border-[#CCCCCC] focus:border-[#2F5D50]"
              }`}
            />
            {nameError && (
              <p className="text-[#D1342C] text-[13px] mt-1 font-normal">
                {nameError}
              </p>
            )}
          </div>

          {/* Trường Giá bán */}
          <div className="mb-4">
            <label
              htmlFor="dishPriceInput"
              className="block font-bold text-[16px] text-[#22201C] mb-2"
            >
              Giá bán
            </label>
            <div className="relative">
              <input
                id="dishPriceInput"
                type="text"
                value={dishPrice}
                onChange={(e) => {
                  setDishPrice(e.target.value);
                  if (priceError) setPriceError(null);
                }}
                placeholder="Nhập giá bán"
                className={`w-full h-[48px] pl-3.5 pr-9 rounded-[14px] bg-white text-[15px] text-[#22201C] focus:outline-none transition-colors ${
                  priceError
                    ? "border-2 border-[#D1342C] focus:border-[#D1342C]"
                    : "border border-[#CCCCCC] focus:border-[#2F5D50]"
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] text-[#22201C]">
                đ
              </span>
            </div>
            {priceError && (
              <p className="text-[#D1342C] text-[13px] mt-1 font-normal">
                {priceError}
              </p>
            )}
          </div>

          {/* Trường Hình ảnh minh họa */}
          <div className="mb-8">
            <label className="block font-bold text-[16px] text-[#22201C] leading-snug">
              Hình ảnh minh họa
            </label>
            <p className="text-[13px] text-[#666666] mt-0.5 mb-3">
              Không chọn hình sẽ dùng hình mặc định
            </p>

            <div className="flex items-center space-x-4">
              {/* Khung xem trước hình ảnh */}
              <div className="w-[85px] h-[85px] rounded-[18px] bg-[#E8E2D5] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Xem trước"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CoffeeCupIcon className="w-10 h-10 text-[#5C3A0E]/70" />
                )}
              </div>

              {/* Nút Chọn / Đổi hình ảnh */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[42px] px-4 rounded-[12px] bg-white border border-[#2F5D50] text-[#2F5D50] font-semibold text-[14px] flex items-center space-x-2 cursor-pointer active:scale-95 transition-all hover:bg-[#2F5D50]/5"
                >
                  <svg
                    className="w-4 h-4 text-[#2F5D50]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>
                    {imagePreview ? "Đổi hình ảnh" : "Chọn hình ảnh"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Nút Lưu màu xanh đậm chuẩn Figma */}
          <button
            type="submit"
            className="w-full h-[50px] rounded-[14px] bg-[#2F5D50] text-white font-bold text-[16px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm"
          >
            Lưu
          </button>
        </form>
      </div>

      {/* Modal báo lỗi hệ thống */}
      <ModalConfirm
        isOpen={!!systemError}
        type="error"
        message={systemError}
        onClose={() => setSystemError(null)}
      />
    </AdminLayout>
  );
};
