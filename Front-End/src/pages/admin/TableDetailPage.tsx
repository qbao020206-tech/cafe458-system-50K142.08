import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { TableItem } from "../../types/table";
import {
  getTableById,
  deleteTable,
  confirmEmptyTable,
} from "../../services/tableService";
import { ModalActionDialog } from "../../components/common/ModalActionDialog";
import { ModalConfirm } from "../../components/common/ModalConfirm";

export const TableDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [table, setTable] = useState<TableItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal xác nhận xóa bàn (UC 4.3)
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

  const fetchTable = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getTableById(id);
      if (!data) {
        navigate("/admin/tables", { replace: true });
        return;
      }
      setTable(data);
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
    fetchTable();
  }, [fetchTable]);

  // Xóa bàn (UC 4.3)
  const handleDeleteTable = async () => {
    if (!id || !table) return;
    try {
      setIsDeleteDialogOpen(false);
      await deleteTable(id);

      // Hiển thị thông báo thành công chuẩn UC 4.3: "Xóa bàn thành công"
      setFeedbackModal({
        isOpen: true,
        type: "success",
        message: "Xóa bàn thành công",
        onAfterClose: () => navigate("/admin/tables", { replace: true }),
      });

      setTimeout(() => {
        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
        navigate("/admin/tables", { replace: true });
      }, 1200);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: err?.message || "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  // Xác nhận bàn trống (UC 4.4)
  const handleConfirmEmpty = async () => {
    if (!id) return;
    try {
      await confirmEmptyTable(id);

      // Hiển thị thông báo thành công chuẩn UC 4.4: "Đã đưa bàn về trạng thái Trống"
      setFeedbackModal({
        isOpen: true,
        type: "success",
        message: "Đã đưa bàn về trạng thái Trống",
        onAfterClose: () => navigate("/admin/tables", { replace: true }),
      });

      setTimeout(() => {
        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
        navigate("/admin/tables", { replace: true });
      }, 1200);
    } catch {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  if (loading || !table) {
    return (
      <AdminLayout
        title="Quản lý bàn"
        showBackButton={true}
        onBackClick={() => navigate("/admin/tables")}
      >
        <div className="py-24 text-center text-[#666666] text-[14px]">
          Đang tải thông tin bàn...
        </div>
      </AdminLayout>
    );
  }

  const isServing = table.status === "Đang phục vụ";

  return (
    <AdminLayout
      title="Quản lý bàn"
      showBackButton={true}
      onBackClick={() => navigate("/admin/tables")}
    >
      <div className="px-[16px]">
        {/* Tiêu đề Sơ đồ bàn & Nút + Thêm bàn */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[22px] font-bold text-[#22201C] tracking-tight">
            Sơ đồ bàn
          </h2>

          <button
            type="button"
            onClick={() => navigate("/admin/tables/add")}
            className="h-[38px] px-4 rounded-full bg-[#2F5D50] text-white text-[14px] font-medium flex items-center space-x-1.5 shadow-sm cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-[17px] leading-none mb-0.5">+</span>
            <span>Thêm bàn</span>
          </button>
        </div>

        {/* Khung thông tin bàn chuẩn Figma */}
        {!feedbackModal.isOpen && (
          <div className="bg-white border border-black rounded-2xl p-6 shadow-sm mt-12">
            {/* Hàng thông tin bàn và các nút tác vụ */}
            <div className="flex items-start justify-between">
              {/* Tên bàn */}
              <span className="font-bold text-[18px] text-[#1D4ED8] pt-1">
                Bàn {table.id}
              </span>

              {/* Trạng thái và nút Xóa bàn */}
              <div className="flex flex-col items-end space-y-3">
                {isServing ? (
                  /* Bàn đang phục vụ: nhãn vàng */
                  <span className="px-4 py-1.5 rounded-full text-[14px] font-semibold bg-[#FDE8AD] border border-[#F59E0B]/60 text-[#92400E]">
                    Đang phục vụ
                  </span>
                ) : (
                  /* Bàn trống: nhãn xanh dương */
                  <span className="px-5 py-1.5 rounded-full text-[14px] font-semibold bg-[#E1EDFD] border border-[#2563EB]/50 text-[#1D4ED8]">
                    Trống
                  </span>
                )}

                {/* Nút Xóa bàn */}
                <button
                  type="button"
                  onClick={() => {
                    if (isServing) {
                      setFeedbackModal({
                        isOpen: true,
                        type: "error",
                        message: "Chỉ được xóa bàn ở trạng thái Trống!",
                      });
                    } else {
                      setIsDeleteDialogOpen(true);
                    }
                  }}
                  className="px-5 py-2 rounded-[14px] bg-[#8A2424] text-white font-bold text-[15px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                >
                  Xóa bàn
                </button>
              </div>
            </div>

            {/* Nút Xác nhận bàn trống (chỉ hiện khi bàn Đang phục vụ - UC 4.4) */}
            {isServing && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleConfirmEmpty}
                  className="px-7 py-2.5 rounded-full bg-[#2F5D50] text-white font-bold text-[15px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm"
                >
                  Xác nhận bàn trống
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal xác nhận xóa bàn chuẩn UC 4.3 */}
      <ModalActionDialog
        isOpen={isDeleteDialogOpen}
        question="Bạn có chắc chắn muốn xóa bàn này không?"
        cancelText="Hủy"
        confirmText="Xóa"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTable}
      />

      {/* Modal thông báo kết quả (Xóa bàn thành công / Đã đưa bàn về trạng thái Trống / Lỗi) */}
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
