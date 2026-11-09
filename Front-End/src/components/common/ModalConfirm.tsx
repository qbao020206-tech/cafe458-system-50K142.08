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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="mb-4">
          {type === "success" ? (
            <div className="w-14 h-14 rounded-full border-2 border-[#16A34A] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#16A34A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="w-14 h-14 flex items-center justify-center text-[#DC2626]">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          )}
        </div>

        <p className="text-base font-semibold text-gray-900 leading-snug mb-2 whitespace-pre-line">
          {message}
        </p>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 text-sm font-medium rounded-lg transition-all"
          >
            Đóng
          </button>
        )}
      </div>
    </div>
  );
};
