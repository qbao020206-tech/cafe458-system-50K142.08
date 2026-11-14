import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { addAdminDish, uploadDishImage } from "../../services/adminMenuService";
import { CoffeeCupIcon } from "../../components/common/CoffeeCupIcon";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { extractApiError } from "../../services/api";

export const AddDishPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dishName, setDishName] = useState<string>("");
  const [dishPrice, setDishPrice] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Lỗi trường nhập liệu
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Hiển thị preview tức thì
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload ngay lên server để lấy URL lưu trữ
      try {
        setUploadingImage(true);
        const res = await uploadDishImage(file);
        setUploadedUrl(res.image_url);
      } catch {
        // Nếu upload thất bại, vẫn giữ preview để thử lại khi submit
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Chuẩn hóa giá bán: tự động chuyển các số < 1000 (ví dụ 30, 25, 35) hoặc "30k" thành 30.000đ
  const parsePrice = (val: string): number => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return 0;
    const cleanStr = trimmed.replace(/k$/, "");
    const rawNum = Number(cleanStr.replace(/\./g, "").replace(/,/g, ""));
    if (isNaN(rawNum) || rawNum <= 0) return 0;
    // Nếu nhập số < 1000 (ví dụ: 30, 25, 45...) hoặc có hậu tố 'k' thì tự động nhân 1000
    if (rawNum < 1000 || trimmed.includes("k")) {
      return Math.round(rawNum * 1000);
    }
    return Math.round(rawNum);
  };

  const handlePriceBlur = () => {
    if (!dishPrice.trim()) return;
    const parsed = parsePrice(dishPrice);
    if (parsed > 0) {
      setDishPrice(parsed.toLocaleString("vi-VN"));
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
    let parsedPrice = 0;
    if (!trimmedPrice) {
      setPriceError("Không được để trống!");
      hasError = true;
    } else {
      parsedPrice = parsePrice(trimmedPrice);
      if (parsedPrice <= 0) {
        setPriceError("Giá bán phải là số lớn hơn 0!");
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      setSubmitting(true);

      let finalImageUrl = uploadedUrl;
      if (!finalImageUrl && imageFile) {
        try {
          const res = await uploadDishImage(imageFile);
          finalImageUrl = res.image_url;
          setUploadedUrl(res.image_url);
        } catch {
          // Bỏ qua lỗi upload nếu có
        }
      }

      await addAdminDish({
        ten_mon: trimmedName,
        gia_ban: parsedPrice,
        hinh_anh: finalImageUrl || null,
      });

      // Điều hướng về màn hình Danh sách món kèm thông báo thành công (Bảng 76)
      navigate("/admin/menu", {
        replace: true,
        state: { successMessage: "Thêm món thành công" },
      });
    } catch (err: unknown) {
      // Giữ nguyên hình ảnh và thông tin đã chọn khi lỗi (BR-UC3-06)
      const apiErr = extractApiError(err);
      if (apiErr.field === "ten_mon") {
        setNameError(apiErr.message);
      } else if (apiErr.field === "gia_ban") {
        setPriceError(apiErr.message);
      } else if (apiErr.code === "DUPLICATE_NAME" || apiErr.message.includes("tồn tại")) {
        setNameError("Tên món đã tồn tại!");
      } else {
        setSystemError(apiErr.message || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    } finally {
      setSubmitting(false);
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
                onBlur={handlePriceBlur}
                placeholder="Nhập giá bán"
                className={`w-full h-[48px] pl-3.5 pr-10 rounded-[14px] bg-white text-[15px] text-[#22201C] focus:outline-none transition-colors ${
                  priceError
                    ? "border-2 border-[#D1342C] focus:border-[#D1342C]"
                    : "border border-[#CCCCCC] focus:border-[#2F5D50]"
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] font-bold text-[#22201C]">
                đ
              </span>
            </div>
            {priceError && (
              <p className="text-[#D1342C] text-[13px] mt-1 font-normal">
                {priceError}
              </p>
            )}
          </div>

          {/* Khu vực Chọn hình ảnh minh họa chuẩn Figma */}
          <div className="mb-6">
            <span className="block font-bold text-[16px] text-[#22201C] mb-0.5">
              Hình ảnh minh họa
            </span>
            <p className="text-[13px] text-[#666666] font-normal mb-3">
              Không chọn hình sẽ dùng hình mặc định
            </p>

            <div className="flex items-center space-x-3.5">
              {/* Khung hiển thị ảnh preview hoặc icon ly */}
              <div className="w-[80px] h-[80px] rounded-[16px] bg-[#E5DDCB] flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Xem trước món"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CoffeeCupIcon className="w-10 h-10 text-[#7D7265]" />
                )}
              </div>

              {/* Input file ẩn và nút Chọn hình ảnh / Đổi hình ảnh */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="h-[42px] px-4 rounded-[12px] border border-[#2F5D50] bg-white text-[#2F5D50] text-[14px] font-semibold flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform disabled:opacity-60"
              >
                <svg
                  className="w-5 h-5 text-[#2F5D50]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <rect width="18" height="18" x="3" y="3" rx="3" ry="3" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span>
                  {uploadingImage
                    ? "Đang tải ảnh..."
                    : imagePreview
                    ? "Đổi hình ảnh"
                    : "Chọn hình ảnh"}
                </span>
              </button>
            </div>
          </div>

          {/* Nút Lưu chuẩn Figma (toàn chiều rộng, không có nút Hủy) */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[48px] rounded-[12px] bg-[#2F5D50] text-white font-bold text-[16px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm disabled:opacity-60"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
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
