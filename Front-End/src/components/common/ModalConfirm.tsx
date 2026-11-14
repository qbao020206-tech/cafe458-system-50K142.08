import React from "react";

interface ModalConfirmProps {
  isOpen: boolean;
  type: "error" | "success";
  message?: string | null;
  onClose?: () => void;
  position?: "center" | "top";
}

export const ModalConfirm: React.FC<ModalConfirmProps> = ({
  isOpen,
  type,
  message,
  onClose,
  position = "center",
}) => {
  if (!isOpen || !message) return null;

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex ${
        position === "top" ? "items-start pt-[135px]" : "items-center"
      } justify-center bg-black/40 px-6 ${
        onClose ? "cursor-pointer" : ""
      }`}
    >
      <div
        onClick={onClose ? onClose : (e) => e.stopPropagation()}
        className="bg-white w-[280px] max-w-[85%] rounded-2xl p-5 shadow-2xl border border-black flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
      >
        {type === "success" ? (
          <div className="w-14 h-14 rounded-full border-2 border-[#1E5642] flex items-center justify-center mb-3">
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
            className="w-12 h-14 text-[#D1342C] mb-4"
            viewBox="0 0 40 48"
            fill="none"
          >
            <path
              d="M5 6a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3v16c0 13-15 22-15 22S5 35 5 22V6z"
              stroke="#D1342C"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="20"
              y1="13"
              x2="20"
              y2="25"
              stroke="#D1342C"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <circle cx="20" cy="33" r="2.2" fill="#D1342C" />
          </svg>
        )}

        <p className="font-bold text-[#1A1A1A] text-[16px] leading-snug whitespace-pre-line">
          {message}
        </p>
      </div>
    </div>
  );
};
