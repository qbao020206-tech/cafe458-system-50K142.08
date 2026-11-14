import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUnreadOrdersNotification } from "../../services/authService";
import { playNotificationSound } from "../../utils/sound";
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
  const [unconfirmedCount, setUnconfirmedCount] = useState<number>(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [logoutErrorModal, setLogoutErrorModal] = useState<boolean>(false);

  // Polling số đơn mới mỗi 5 giây theo [QĐ-05] và phát chuông thông báo
  useEffect(() => {
    let isMounted = true;
    let lastLatestId: number | null = null;
    let prevCount = 0;
    let isFirstRun = true;

    const checkNotifications = async () => {
      try {
        const data = await getUnreadOrdersNotification(lastLatestId);
        const currentCount = data.unread_count ?? data.count ?? 0;
        const latestId = data.latest_order_id ?? null;

        if (isMounted) {
          setUnconfirmedCount(currentCount);

          // Phát chuông khi có đơn mới
          const hasNewOrder =
            !isFirstRun &&
            ((latestId !== null && (lastLatestId === null || latestId > lastLatestId)) ||
              currentCount > prevCount);

          if (hasNewOrder) {
            playNotificationSound();
            // Bắn event để trang danh sách đơn cập nhật tức thì nếu đang mở
            window.dispatchEvent(new CustomEvent("admin_new_order"));
          }

          if (latestId !== null) {
            lastLatestId = latestId;
          }
          prevCount = currentCount;
          isFirstRun = false;
        }
      } catch {
        // bỏ qua lỗi polling
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000);
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
              ? "bg-[#B42A23] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 10.5L12 3.5l8.5 7V20a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 20v-9.5z" />
            <path d="M9.5 21.5v-4.5a2.5 2.5 0 0 1 5 0v4.5" />
          </svg>
          <span className="text-[11px] font-medium leading-none">Trang chủ</span>
        </button>

        {/* Tab 2: Đơn hàng */}
        <button
          type="button"
          onClick={() => navigate("/admin/orders")}
          className={`flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isOrdersActive
              ? "bg-[#B42A23] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
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
          <span className="text-[11px] font-medium leading-none">Đơn hàng</span>
        </button>

        {/* Tab 3: Menu */}
        <button
          type="button"
          onClick={() => navigate("/admin/menu")}
          className={`flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isMenuActive
              ? "bg-[#B42A23] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
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
          <span className="text-[11px] font-medium leading-none">Menu</span>
        </button>

        {/* Tab 4: Bàn */}
        <button
          type="button"
          onClick={() => navigate("/admin/tables")}
          className={`flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isTablesActive
              ? "bg-[#B42A23] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
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
          <span className="text-[11px] font-medium leading-none">Bàn</span>
        </button>

        {/* Tab 5: Doanh thu */}
        <button
          type="button"
          onClick={() => navigate("/admin/revenue")}
          className={`flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isRevenueActive
              ? "bg-[#B42A23] text-white"
              : "text-[#666666] hover:text-[#22201C]"
          }`}
        >
          <svg
            className="w-5 h-5 mb-0.5"
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
