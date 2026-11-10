import React, { useState } from "react";

interface OrderDatePickerModalProps {
  isOpen: boolean;
  currentDate: string; // "DD/MM/YYYY"
  onClose: () => void;
  onSelectDate: (date: string) => void;
}

export const OrderDatePickerModal: React.FC<OrderDatePickerModalProps> = ({
  isOpen,
  currentDate,
  onClose,
  onSelectDate,
}) => {
  // Trích xuất ngày từ currentDate (ví dụ "31/10/2026")
  const currentDay = parseInt(currentDate.split("/")[0], 10) || 31;
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);

  if (!isOpen) return null;

  // Lịch tháng 10/2026:
  // Ngày 1/10/2026 rơi vào Thứ Năm (T5) -> 3 ô trống đầu (T2, T3, T4)
  // Tháng 10 có 31 ngày
  const emptyDaysBefore = [null, null, null];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleConfirm = () => {
    const formattedDay = selectedDay.toString().padStart(2, "0");
    onSelectDate(`${formattedDay}/10/2026`);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[340px] max-w-[92%] rounded-2xl p-5 shadow-2xl border border-black/10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Tiêu đề tháng năm màu đỏ chuẩn Figma */}
        <h3 className="text-[#D1342C] font-bold text-[18px] text-center mb-4">
          Tháng 10, 2026
        </h3>

        {/* Tiêu đề thứ trong tuần */}
        <div className="grid grid-cols-7 w-full text-center text-[#666666] text-[13px] font-medium mb-2">
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
          <span>CN</span>
        </div>

        {/* Lưới các ngày trong tháng */}
        <div className="grid grid-cols-7 w-full gap-y-2 text-center">
          {emptyDaysBefore.map((_, idx) => (
            <div key={`empty-${idx}`} className="w-[36px] h-[36px] mx-auto" />
          ))}

          {daysInMonth.map((day) => {
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center text-[15px] mx-auto cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#D1342C] text-white font-bold"
                    : "text-[#22201C] hover:bg-[#FAF6EE]"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Nút Tiếp tục */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full h-[46px] rounded-[14px] bg-[#2F5D50] text-white font-bold text-[16px] mt-5 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};
