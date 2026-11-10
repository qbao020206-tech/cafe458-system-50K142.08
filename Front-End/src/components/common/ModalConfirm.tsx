import React from "react";

interface ModalConfirmProps {
  isOpen: boolean;
  type: "error" | "success";
  message?: string | null;
  onClose?: () => void;
}

export const ModalConfirm: React.FC<ModalConfirmProps> = ({
  isOpen,
  type,
  message,
  onClose,
}) => {
  if (!isOpen || !message) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[280px] max-w-[85%] rounded-2xl p-6 shadow-2xl border border-black flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
      >
        {type === "success" ? (
          <div className="w-14 h-14 rounded-full border-2 border-[#1E5642] flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-[#1E5642]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        ) : (
          <svg
            className="w-12 h-14 text-[#D32F2F] mb-4"
            viewBox="0 0 40 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6a3 3 0 0 1 3-3h26a3 3 0 0 1 3 3v18c0 12-16 20-16 20S4 36 4 24V6z" />
            <line x1="20" y1="13" x2="20" y2="24" strokeWidth="2.8" />
            <circle cx="20" cy="31" r="1.6" fill="currentColor" stroke="none" />
          </svg>
        )}

        <p className="font-bold text-[#1A1A1A] text-[15px] leading-snug whitespace-pre-line">
          {message}
        </p>
      </div>
    </div>
  );
};
