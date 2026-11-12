import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUnconfirmedOrdersCount } from "../../services/authService";
import { ModalActionDialog } from "../common/ModalActionDialog";
import { ModalConfirm } from "../common/ModalConfirm";

interface AdminLayoutProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  breadcrumb?: React.ReactNode;
  noMainPadding?: boolean;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  breadcrumb,
  noMainPadding = false,
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [unconfirmedCount, setUnconfirmedCount] = useState<number>(2);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [logoutErrorModal, setLogoutErrorModal] = useState<boolean>(false);

  // Polling số đơn mới mỗi 5 giây theo [QĐ-05]
  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      try {
        const count = await getUnconfirmedOrdersCount();
        if (isMounted) setUnconfirmedCount(count);
      } catch {
        // bỏ qua lỗi polling
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleConfirmLogout = async () => {
    try {
      setShowLogoutConfirm(false);
      await logout();
      navigate("/login");
    } catch {
      setShowLogoutConfirm(false);
      setLogoutErrorModal(true);
    }
  };

  // Xác định tab nào đang active
  const pathname = location.pathname;
  const isHomeActive =
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname === "/admin/change-password";
  const isOrdersActive = pathname.startsWith("/admin/orders");
  const isMenuActive = pathname.startsWith("/admin/menu");
  const isTablesActive = pathname.startsWith("/admin/tables");
  const isRevenueActive = pathname.startsWith("/admin/revenue");

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#22201C] w-[390px] max-w-[390px] mx-auto relative flex flex-col font-['Be_Vietnam_Pro'] antialiased shadow-sm select-none">
      {/* Header đỏ chuẩn Figma: cao 88px, px-4 */}
      <header className="bg-[#D1342C] text-white h-[88px] px-[16px] flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center">
          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className="w-[36px] h-[36px] rounded-[10px] border border-white flex items-center justify-center mr-3 active:scale-95 transition-transform flex-shrink-0 cursor-pointer"
              aria-label="Quay lại"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 12H5m7 7l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <h1 className="text-[24px] font-bold tracking-tight text-white leading-none">
            {title}
          </h1>
        </div>

        {/* Nút chuông thông báo và Avatar "C" */}
        <div className="flex items-center space-x-3 relative">
          {/* Chuông thông báo đơn mới (QĐ-05) */}
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="relative p-2 text-white active:scale-95 transition-transform cursor-pointer"
            aria-label="Thông báo đơn mới"
          >
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unconfirmedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-yellow-400 rounded-full ring-2 ring-[#D1342C]" />
            )}
          </button>

          {/* Avatar "C" của chủ quán */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center text-[#D1342C] font-bold text-[20px] shadow-sm cursor-pointer active:scale-95 transition-transform"
            aria-label="Menu tài khoản"
          >
            C
          </button>

          {/* Dropdown Menu tài khoản: Đổi mật khẩu & Đăng xuất (UC 8 - Bảng 128) */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-[52px] w-[176px] bg-white rounded-[16px] shadow-lg border border-[#E8E0D2]/60 py-2 px-2 z-50 text-[14px]">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/admin/change-password");
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-[10px] hover:bg-[#FAF6EE] text-[#333333] font-medium flex items-center space-x-3 cursor-pointer transition-colors"
                >
                  <svg
                    className="w-[18px] h-[18px] text-[#4A4A4A] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 7a4 4 0 10-5.657 5.657l-6.343 6.343h3v3h3v-3h2l1.657-1.657A4 4 0 0015 7z"
                    />
                  </svg>
                  <span>Đổi mật khẩu</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-[10px] hover:bg-[#FAF6EE] text-[#333333] font-medium flex items-center space-x-3 cursor-pointer transition-colors"
                >
                  <svg
                    className="w-[18px] h-[18px] text-[#4A4A4A] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Thanh Breadcrumb (nếu có) nằm sát header */}
      {breadcrumb && (
        <div className="bg-white border-b border-[#E8E0D2] px-[16px] py-3 text-[14px]">
          {breadcrumb}
        </div>
      )}

      {/* Nội dung chính */}
      <main className={`flex-1 w-full ${noMainPadding ? "pt-0" : "pt-[20px]"} pb-24`}>{children}</main>

      {/* Thanh Bottom Tab Bar chuẩn Figma: cao 64px, 5 tab */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[390px] h-[64px] mx-auto bg-white border-t border-[#E8E0D2] flex items-stretch z-30 shadow-sm">
        {/* Tab 1: Trang chủ */}
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className={`flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isHomeActive
              ? "bg-[#D1342C] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-[11px] font-medium leading-none">Trang chủ</span>
        </button>

        {/* Tab 2: Đơn hàng */}
        <button
          type="button"
          onClick={() => navigate("/admin/orders")}
          className={`flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isOrdersActive
              ? "bg-[#D1342C] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
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
          <span className="text-[11px] font-medium leading-none">Đơn hàng</span>
        </button>

        {/* Tab 3: Menu */}
        <button
          type="button"
          onClick={() => navigate("/admin/menu")}
          className={`flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isMenuActive
              ? "bg-[#D1342C] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
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
          <span className="text-[11px] font-medium leading-none">Menu</span>
        </button>

        {/* Tab 4: Bàn */}
        <button
          type="button"
          onClick={() => navigate("/admin/tables")}
          className={`flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isTablesActive
              ? "bg-[#D1342C] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
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
          <span className="text-[11px] font-medium leading-none">Bàn</span>
        </button>

        {/* Tab 5: Doanh thu */}
        <button
          type="button"
          onClick={() => navigate("/admin/revenue")}
          className={`flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isRevenueActive
              ? "bg-[#D1342C] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
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
          <span className="text-[11px] font-medium leading-none">Doanh thu</span>
        </button>
      </nav>

      {/* Hộp thoại xác nhận đăng xuất (UC 8 - Bảng 129) */}
      <ModalActionDialog
        isOpen={showLogoutConfirm}
        question="Bạn có muốn đăng xuất không?"
        cancelText="Không"
        confirmText="Có"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Popup lỗi đăng xuất không thành công (UC 8 - Bảng 131) */}
      <ModalConfirm
        isOpen={logoutErrorModal}
        type="error"
        message="Có lỗi xảy ra, vui lòng thử lại!"
        onClose={() => setLogoutErrorModal(false)}
      />
    </div>
  );
};
