import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { TableItem } from "../../types/table";
import { getTables } from "../../services/tableService";
import { EmptyClipboardIcon } from "../../components/common/EmptyClipboardIcon";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { extractApiError } from "../../services/api";

export const TableListPage: React.FC = () => {
  const navigate = useNavigate();

  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await getTables();
      setTables(data);
    } catch (err: unknown) {
      const apiErr = extractApiError(err);
      setErrorMessage(apiErr.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return (
    <AdminLayout
      title="Quản lý bàn"
      showBackButton={true}
      onBackClick={() => navigate("/admin")}
    >
      <div className="px-[16px]">
        {/* Tiêu đề Sơ đồ bàn & Nút + Thêm bàn chuẩn Figma */}
        <div className="flex items-center justify-between mb-5">
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

        {/* Nội dung: Đang tải / Màn hình rỗng / Lưới sơ đồ bàn */}
        {loading ? (
          <div className="py-24 text-center text-[#666666] text-[14px]">
            Đang tải sơ đồ bàn...
          </div>
        ) : errorMessage ? null : tables.length === 0 ? (
          /* Màn hình rỗng chuẩn UC 4.1 - Chưa có bàn */
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <EmptyClipboardIcon className="w-14 h-16 text-[#666666] mb-3" />
            <p className="text-[#666666] text-[16px] font-medium">
              Chưa có bàn nào
            </p>
          </div>
        ) : (
          /* Lưới 2 cột các bàn chuẩn Figma */
          <div className="grid grid-cols-2 gap-3.5 pb-6">
            {tables.map((table) => {
              const isServing = table.status === "Đang phục vụ";

              return (
                <div
                  key={table.id}
                  onClick={() => navigate(`/admin/tables/${table.id}`)}
                  className={`h-[145px] rounded-[22px] p-4 flex flex-col items-center justify-start text-center cursor-pointer active:scale-95 transition-all shadow-sm ${
                    isServing
                      ? "bg-[#FDE8AD] border border-[#F59E0B]/50 hover:border-[#F59E0B]"
                      : "bg-[#E1EDFD] border border-[#2563EB]/40 hover:border-[#2563EB]"
                  }`}
                >
                  <span
                    className={`font-bold text-[18px] leading-tight ${
                      isServing ? "text-[#B45309]" : "text-[#1D4ED8]"
                    }`}
                  >
                    Bàn {table.id}
                  </span>
                  <span
                    className={`font-bold text-[18px] mt-1 leading-tight ${
                      isServing ? "text-[#92400E]" : "text-[#22201C]"
                    }`}
                  >
                    {table.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal báo lỗi tải dữ liệu */}
      <ModalConfirm
        isOpen={!!errorMessage}
        type="error"
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
    </AdminLayout>
  );
};
