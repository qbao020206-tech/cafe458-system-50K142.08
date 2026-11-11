import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Dish } from "../../types/menu";
import { getAdminDishes, deleteAdminDish } from "../../services/adminMenuService";
import { formatCurrency } from "../../utils/formatCurrency";
import { CoffeeCupIcon } from "../../components/common/CoffeeCupIcon";
import { ModalActionDialog } from "../../components/common/ModalActionDialog";
import { ModalConfirm } from "../../components/common/ModalConfirm";

export const MenuListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Món cần xóa
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

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

  const fetchDishes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminDishes();
      setDishes(data);
    } catch {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Có lỗi xảy ra, vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDishes();

    // Kiểm tra xem có thông báo chuyển trang từ Thêm món hoặc Cập nhật món không
    if (location.state && (location.state as any).successMessage) {
      setFeedbackModal({
        isOpen: true,
        type: "success",
        message: (location.state as any).successMessage,
      });

      // Tự động đóng modal sau 1.5 giây
      setTimeout(() => {
        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
      }, 1500);

      // Xóa state điều hướng để tránh lặp lại khi F5
      window.history.replaceState({}, document.title);
    }
  }, [fetchDishes, location.state]);

  const handleConfirmDelete = async () => {
    if (!dishToDelete) return;
    try {
      await deleteAdminDish(dishToDelete.ma_mon);
      setDishToDelete(null);

      // Hiển thị thông báo thành công chuẩn UC 3.3: "Đã xóa món thành công"
      setFeedbackModal({
        isOpen: true,
        type: "success",
        message: "Đã xóa món thành công",
      });

      fetchDishes();

      setTimeout(() => {
        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
      }, 1500);
    } catch {
      setDishToDelete(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  return (
    <AdminLayout
      title="Quản lý menu"
      showBackButton={true}
      onBackClick={() => navigate("/admin")}
    >
      <div className="px-[16px]">
        {/* Tiêu đề Danh sách món & Nút + Thêm món chuẩn Figma */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-bold text-[#22201C] tracking-tight">
            Danh sách món
          </h2>

          <button
            type="button"
            onClick={() => navigate("/admin/menu/add")}
            className="h-[38px] px-4 rounded-full bg-[#2F5D50] text-white text-[14px] font-medium flex items-center space-x-1.5 shadow-sm cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-[17px] leading-none mb-0.5">+</span>
            <span>Thêm món</span>
          </button>
        </div>

        {/* Nội dung: Đang tải / Màn hình rỗng / Danh sách món */}
        {loading ? (
          <div className="py-24 text-center text-[#666666] text-[14px]">
            Đang tải danh sách món...
          </div>
        ) : dishes.length === 0 ? (
          /* Màn hình rỗng chuẩn UC 3.1 - Menu chưa có món */
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <CoffeeCupIcon className="w-12 h-14 text-[#666666] mb-3" />
            <p className="text-[#666666] text-[16px] font-medium">
              Menu chưa có món nào
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 pb-6">
            {dishes.map((dish) => {
              const isHidden = dish.trang_thai === "Ẩn";

              return (
                <div
                  key={dish.ma_mon}
                  className="bg-white rounded-[20px] p-4 shadow-sm border border-[#E8E0D2]"
                >
                  {/* Hàng thông tin món: ảnh, tên, giá, nhãn trạng thái */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      {/* Ảnh minh họa hoặc icon ly cà phê mặc định */}
                      <div className="w-[56px] h-[56px] rounded-[14px] bg-[#E8E2D5] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {dish.hinh_anh ? (
                          <img
                            src={dish.hinh_anh}
                            alt={dish.ten_mon}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CoffeeCupIcon className="w-7 h-7 text-[#5C3A0E]/70" />
                        )}
                      </div>

                      {/* Tên và Giá bán */}
                      <div className="min-w-0">
                        <h3 className="font-bold text-[17px] text-[#22201C] leading-snug truncate">
                          {dish.ten_mon}
                        </h3>
                        <p className="text-[14px] text-[#666666] mt-0.5 leading-tight">
                          {formatCurrency(dish.gia_ban)}
                        </p>
                      </div>
                    </div>

                    {/* Nhãn trạng thái */}
                    <div className="flex-shrink-0">
                      {isHidden ? (
                        <span className="px-3.5 py-1 rounded-full text-[12px] font-semibold bg-[#E8E8E8] text-[#4B5563]">
                          Ẩn
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#D1EAE2] text-[#1E5642]">
                          Hiển thị
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hai nút viền: Cập nhật món & Xóa món chuẩn Figma */}
                  <div className="grid grid-cols-2 gap-3 mt-3.5 pt-1">
                    {/* Nút Cập nhật món */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/menu/edit/${dish.ma_mon}`)
                      }
                      className="h-[40px] rounded-[12px] bg-white border border-[#2F5D50] text-[#2F5D50] font-semibold text-[14px] flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all hover:bg-[#2F5D50]/5"
                    >
                      <svg
                        className="w-4 h-4 text-[#2F5D50]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      <span>Cập nhật món</span>
                    </button>

                    {/* Nút Xóa món */}
                    <button
                      type="button"
                      onClick={() => setDishToDelete(dish)}
                      className="h-[40px] rounded-[12px] bg-white border border-[#8A2424] text-[#8A2424] font-semibold text-[14px] flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all hover:bg-red-50"
                    >
                      <svg
                        className="w-4 h-4 text-[#8A2424]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Xóa món</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal xác nhận xóa món chuẩn UC 3.3 */}
      <ModalActionDialog
        isOpen={!!dishToDelete}
        question="Bạn có chắc chắn muốn xóa món này không?"
        cancelText="Hủy"
        confirmText="Xóa"
        onCancel={() => setDishToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal thông báo kết quả (Đã xóa món thành công / Thêm thành công / Cập nhật thành công / Lỗi) */}
      <ModalConfirm
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </AdminLayout>
  );
};
