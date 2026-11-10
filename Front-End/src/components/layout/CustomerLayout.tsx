import React from "react";
import { useNavigate } from "react-router-dom";

interface CustomerLayoutProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#22201C] w-[390px] max-w-[390px] mx-auto relative flex flex-col font-['Be_Vietnam_Pro'] antialiased shadow-sm select-none">
      {/* Thanh tiêu đề: cao 88px, px-4, py-5, màu nền #D1342C chuẩn Figma */}
      <header className="bg-[#D1342C] text-white h-[88px] px-[16px] flex items-center sticky top-0 z-30 flex-shrink-0">
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
      </header>

      {/* Nội dung trang */}
      <main className="flex-1 w-full pt-[20px] pb-6">{children}</main>
    </div>
  );
};
