import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { RevenuePeriodType, RevenueSummaryItem } from "../../types/revenue";
import { getRevenueSummary } from "../../services/revenueService";
import { formatCurrency } from "../../utils/formatCurrency";
import { EmptyClipboardIcon } from "../../components/common/EmptyClipboardIcon";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { extractApiError } from "../../services/api";

export const RevenueSummaryPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<RevenuePeriodType>("ngày");
  const [summaries, setSummaries] = useState<RevenueSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSummary = useCallback(async (tab: RevenuePeriodType) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await getRevenueSummary(tab);
      setSummaries(data);
    } catch (err: unknown) {
      const apiErr = extractApiError(err);
      setErrorMessage(apiErr.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(activeTab);
  }, [activeTab, fetchSummary]);

  return (
    <AdminLayout
      title="Quản lý doanh thu"
      showBackButton={true}
      onBackClick={() => navigate("/admin")}
    >
      <div className="px-[16px]">
        {/* 3 Tab chuyển đổi: Ngày, Tháng, Năm chuẩn Figma */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("ngày")}
            className={`h-[44px] rounded-[14px] font-bold text-[15px] flex items-center justify-center cursor-pointer transition-all ${
              activeTab === "ngày"
                ? "bg-[#D1342C] text-white shadow-sm"
                : "bg-[#E8E2D5] text-[#555555] hover:bg-[#E0DAD0]"
            }`}
          >
            Ngày
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tháng")}
            className={`h-[44px] rounded-[14px] font-bold text-[15px] flex items-center justify-center cursor-pointer transition-all ${
              activeTab === "tháng"
                ? "bg-[#D1342C] text-white shadow-sm"
                : "bg-[#E8E2D5] text-[#555555] hover:bg-[#E0DAD0]"
            }`}
          >
            Tháng
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("năm")}
            className={`h-[44px] rounded-[14px] font-bold text-[15px] flex items-center justify-center cursor-pointer transition-all ${
              activeTab === "năm"
                ? "bg-[#D1342C] text-white shadow-sm"
                : "bg-[#E8E2D5] text-[#555555] hover:bg-[#E0DAD0]"
            }`}
          >
            Năm
          </button>
        </div>

        {/* Tiêu đề Tổng doanh thu */}
        <h2 className="text-[22px] font-bold text-[#22201C] mb-3.5 tracking-tight">
          Tổng doanh thu
        </h2>

        {/* Nội dung danh sách hoặc màn hình rỗng */}
        {loading ? (
          <div className="py-24 text-center text-[#666666] text-[14px]">
            Đang tải dữ liệu doanh thu...
          </div>
        ) : errorMessage ? null : summaries.length === 0 ? (
          /* Màn hình rỗng chuẩn UC 5.1 - Chưa có doanh thu nào */
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <EmptyClipboardIcon className="w-14 h-16 text-[#666666] mb-3" />
            <p className="text-[#666666] text-[16px] font-medium">
              Chưa có doanh thu nào
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 pb-6">
            {summaries.map((item, idx) => (
              <div
                key={idx}
                onClick={() =>
                  navigate(
                    `/admin/revenue/detail?period=${encodeURIComponent(
                      item.period
                    )}`
                  )
                }
                className="bg-white border border-[#E8E0D2] rounded-[16px] h-[52px] px-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform shadow-sm hover:border-[#D1342C]/40"
              >
                <span className="font-normal text-[16px] text-[#22201C]">
                  {item.period}
                </span>
                <span className="font-bold text-[17px] text-[#22201C]">
                  {formatCurrency(item.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal báo lỗi truy xuất dữ liệu */}
      <ModalConfirm
        isOpen={!!errorMessage}
        type="error"
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
    </AdminLayout>
  );
};
