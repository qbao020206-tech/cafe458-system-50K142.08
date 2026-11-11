import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { RevenueDetail } from "../../types/revenue";
import { getRevenueDetail } from "../../services/revenueService";
import { formatCurrency } from "../../utils/formatCurrency";
import { ModalConfirm } from "../../components/common/ModalConfirm";

export const RevenueDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const periodParam = searchParams.get("period") || "31/10/2026";

  const [detail, setDetail] = useState<RevenueDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await getRevenueDetail(periodParam);
      setDetail(data);
    } catch {
      setErrorMessage("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [periodParam]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <AdminLayout
      title="Quản lý doanh thu"
      showBackButton={true}
      onBackClick={() => navigate("/admin/revenue")}
      noMainPadding={true}
      breadcrumb={
        <div className="flex items-center space-x-1.5 text-[14px]">
          <button
            type="button"
            onClick={() => navigate("/admin/revenue")}
            className="text-[#D1342C] hover:underline cursor-pointer"
          >
            Doanh thu
          </button>
          <span className="text-[#666666]">&gt;&gt;</span>
          <span className="text-[#22201C] font-medium">{periodParam}</span>
        </div>
      }
    >
      <div className="px-[16px] pt-4 pb-8">
        {loading || !detail ? (
          <div className="py-24 text-center text-[#666666] text-[14px]">
            Đang tải chi tiết doanh thu...
          </div>
        ) : (
          <>
            {/* Card 1: Doanh thu theo phương thức thanh toán chuẩn Figma */}
            <div className="bg-white rounded-[20px] p-4 mb-4 shadow-sm border border-[#E8E0D2]">
              <h3 className="font-bold text-[17px] text-[#22201C] pb-3 border-b border-[#F0EAE1]/80">
                Doanh thu theo phương thức thanh toán
              </h3>

              <div className="divide-y divide-[#F0EAE1]/80">
                {/* Tiền mặt */}
                <div className="flex items-center justify-between py-3 text-[16px]">
                  <span className="font-normal text-[#22201C]">Tiền mặt</span>
                  <span className="font-bold text-[#22201C]">
                    {formatCurrency(detail.cashRevenue)}
                  </span>
                </div>

                {/* Chuyển khoản */}
                <div className="flex items-center justify-between py-3 text-[16px]">
                  <span className="font-normal text-[#22201C]">
                    Chuyển khoản
                  </span>
                  <span className="font-bold text-[#22201C]">
                    {formatCurrency(detail.transferRevenue)}
                  </span>
                </div>

                {/* Tổng doanh thu */}
                <div className="flex items-center justify-between py-3 text-[16px]">
                  <span className="font-bold text-[#22201C]">
                    Tổng doanh thu
                  </span>
                  <span className="font-bold text-[#22201C]">
                    {formatCurrency(detail.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Thống kê bán hàng theo món chuẩn Figma (UC 5.3) */}
            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-[#E8E0D2]">
              {/* Header: Tổng số ly bán ra */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]/80">
                <span className="font-bold text-[17px] text-[#22201C]">
                  Tổng số ly bán ra
                </span>
                <span className="font-bold text-[17px] text-[#22201C]">
                  {detail.totalCups} ly
                </span>
              </div>

              {/* Danh sách từng món bán ra xếp giảm dần */}
              <div className="divide-y divide-[#F0EAE1]/60">
                {detail.dishStats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 text-[16px]"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-normal text-[#22201C]">
                        {stat.dishName}
                      </span>

                      {/* Nhãn Bán chạy nhất (đồng hạng nếu cùng số lượng cao nhất - BR-UC5-09) */}
                      {stat.isBestSeller && (
                        <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#D1EAE2] text-[#1E5642]">
                          Bán chạy nhất
                        </span>
                      )}
                    </div>

                    <span className="font-bold text-[#22201C]">
                      {stat.quantity} ly
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
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
