import React from "react";

interface ModalActionDialogProps {
  isOpen: boolean;
  question: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ModalActionDialog: React.FC<ModalActionDialogProps> = ({
  isOpen,
  question,
  cancelText = "Hủy",
  confirmText = "Xóa",
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[328px] max-w-[90%] rounded-2xl px-6 py-6 shadow-2xl border border-black flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
      >
        <p className="font-bold text-[#22201C] text-[17px] leading-snug mb-6 whitespace-pre-line">
          {question}
        </p>

        <div className="flex items-center justify-between gap-4 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-[48px] rounded-[14px] bg-white border-2 border-[#D1342C] text-[#D1342C] font-bold text-[16px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-[48px] rounded-[14px] bg-[#2F5D50] text-white font-bold text-[16px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
