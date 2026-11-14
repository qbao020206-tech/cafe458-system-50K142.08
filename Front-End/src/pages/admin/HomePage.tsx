import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { getUnconfirmedOrdersCount } from "../../services/authService";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [unconfirmedCount, setUnconfirmedCount] = useState<number>(2);

  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      try {
        const count = await getUnconfirmedOrdersCount();
        if (isMounted) setUnconfirmedCount(count);
      } catch {
        // bỏ qua
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <AdminLayout title="Trang chủ">
      <div className="px-[20px]">
        {/* Lời chào mừng lớn màu đỏ chuẩn Figma */}
        <h2 className="text-[#D1342C] font-bold text-[28px] leading-[1.25] mt-2 mb-8">
          Chào mừng bạn đã
          <br />
          quay trở lại!
        </h2>

        {/* Lưới 4 ô chức năng quản lý: kích thước 165x140px chuẩn Figma */}
        <div className="grid grid-cols-2 gap-[16px]">
          {/* Ô 1: Đơn hàng */}
          <div
            onClick={() => navigate("/admin/orders")}
            className="w-[165px] h-[140px] bg-white rounded-[16px] border border-[#E8E0D2] p-[16px] flex flex-col justify-between shadow-sm cursor-pointer hover:border-[#D1342C]/40 active:scale-95 transition-all"
          >
            <div className="w-[44px] h-[44px] rounded-[12px] bg-[#2F5D50] flex items-center justify-center text-white flex-shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="4" width="14" height="17" rx="2.5" />
                <path d="M9 4.5V3a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3v1.5" />
                <circle cx="8.5" cy="9" r="0.75" fill="currentColor" stroke="none" />
                <line x1="11" y1="9" x2="15.5" y2="9" />
                <circle cx="8.5" cy="13" r="0.75" fill="currentColor" stroke="none" />
                <line x1="11" y1="13" x2="15.5" y2="13" />
                <circle cx="8.5" cy="17" r="0.75" fill="currentColor" stroke="none" />
                <line x1="11" y1="17" x2="15.5" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#D1342C] leading-tight">
                Đơn hàng
              </h3>
              <p className="text-[13px] text-[#666666] mt-1 leading-tight">
                {unconfirmedCount} đơn chưa xác nhận
              </p>
            </div>
          </div>

          {/* Ô 2: Menu */}
          <div
            onClick={() => navigate("/admin/menu")}
            className="w-[165px] h-[140px] bg-white rounded-[16px] border border-[#E8E0D2] p-[16px] flex flex-col justify-between shadow-sm cursor-pointer hover:border-[#D1342C]/40 active:scale-95 transition-all"
          >
            <div className="w-[44px] h-[44px] rounded-[12px] bg-[#2F5D50] flex items-center justify-center text-white flex-shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8.5" y1="4.5" x2="8.5" y2="7" />
                <line x1="12" y1="4" x2="12" y2="7" />
                <line x1="15.5" y1="4.5" x2="15.5" y2="7" />
                <path d="M5.5 8.5h11v6.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4v-6.5z" />
                <path d="M16.5 10.5h1.5a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-1.5" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#D1342C] leading-tight">
                Menu
              </h3>
              <p className="text-[13px] text-[#666666] mt-1 leading-tight">
                Thực đơn của quán
              </p>
            </div>
          </div>

          {/* Ô 3: Bàn */}
          <div
            onClick={() => navigate("/admin/tables")}
            className="w-[165px] h-[140px] bg-white rounded-[16px] border border-[#E8E0D2] p-[16px] flex flex-col justify-between shadow-sm cursor-pointer hover:border-[#D1342C]/40 active:scale-95 transition-all"
          >
            <div className="w-[44px] h-[44px] rounded-[12px] bg-[#2F5D50] flex items-center justify-center text-white flex-shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <ellipse cx="12" cy="7" rx="8" ry="3.2" />
                <line x1="12" y1="10.2" x2="12" y2="18" />
                <ellipse cx="12" cy="19.2" rx="3.5" ry="1.5" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#D1342C] leading-tight">
                Bàn
              </h3>
              <p className="text-[13px] text-[#666666] mt-1 leading-tight">
                Trạng thái và mã QR
              </p>
            </div>
          </div>

          {/* Ô 4: Doanh thu */}
          <div
            onClick={() => navigate("/admin/revenue")}
            className="w-[165px] h-[140px] bg-white rounded-[16px] border border-[#E8E0D2] p-[16px] flex flex-col justify-between shadow-sm cursor-pointer hover:border-[#D1342C]/40 active:scale-95 transition-all"
          >
            <div className="w-[44px] h-[44px] rounded-[12px] bg-[#2F5D50] flex items-center justify-center text-white flex-shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 13l5-6 5 5 8-8.5" />
                <line x1="3" y1="16" x2="3" y2="21" />
                <line x1="9" y1="13" x2="9" y2="21" />
                <line x1="15" y1="17" x2="15" y2="21" />
                <line x1="21" y1="9" x2="21" y2="21" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#D1342C] leading-tight">
                Doanh thu
              </h3>
              <p className="text-[13px] text-[#666666] mt-1 leading-tight">
                Thống kê bán hàng
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
