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
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F2937] flex flex-col justify-between max-w-md mx-auto shadow-md relative font-sans">
      <header className="bg-[#C22222] text-white px-4 py-4 flex items-center sticky top-0 z-30 shadow-sm">
        {showBackButton && (
          <button
            type="button"
            onClick={handleBack}
            className="mr-3 p-1.5 rounded-lg border border-white/60 hover:bg-white/10 active:scale-95 transition-transform"
            aria-label="Quay lại"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold tracking-wide">{title}</h1>
      </header>
      <main className="flex-1 p-4 pb-28">{children}</main>
    </div>
  );
};
