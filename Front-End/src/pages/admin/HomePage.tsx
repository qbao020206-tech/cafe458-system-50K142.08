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
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
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
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <line x1="8" y1="5" x2="8" y2="7" />
                <line x1="12" y1="5" x2="12" y2="7" />
                <line x1="16" y1="5" x2="16" y2="7" />
                <path d="M5 9h14v7a4 4 0 01-4 4H9a4 4 0 01-4-4V9z" />
                <path d="M19 11h1a2.5 2.5 0 010 5h-1" />
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
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8h16M7 8a5 5 0 0110 0M12 8v10m-4 0h8"
                />
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
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
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
