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
            className="w-12 h-16 text-[#D1342C] mb-4"
            viewBox="0 0 46 64"
            fill="none"
          >
            <rect
              x="2"
              y="2"
              width="42"
              height="60"
              rx="21"
              stroke="#D1342C"
              strokeWidth="3.2"
            />
            <line
              x1="23"
              y1="16"
              x2="23"
              y2="36"
              stroke="#D1342C"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="23" cy="47" r="2.5" fill="#D1342C" />
          </svg>
        )}

        <p className="font-bold text-[#1A1A1A] text-[15px] leading-snug whitespace-pre-line">
          {message}
        </p>
      </div>
    </div>
  );
};
