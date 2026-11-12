import React, { useState, useEffect } from "react";

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
  const parts = currentDate.split("/");
  const initialDay = parseInt(parts[0], 10) || new Date().getDate();
  const initialMonth = parseInt(parts[1], 10) || new Date().getMonth() + 1;
  const initialYear = parseInt(parts[2], 10) || new Date().getFullYear();

  const [year, setYear] = useState<number>(initialYear);
  const [month, setMonth] = useState<number>(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);

  useEffect(() => {
    if (isOpen) {
      const p = currentDate.split("/");
      const d = parseInt(p[0], 10) || new Date().getDate();
      const m = parseInt(p[1], 10) || new Date().getMonth() + 1;
      const y = parseInt(p[2], 10) || new Date().getFullYear();
      setYear(y);
      setMonth(m);
      setSelectedDay(d);
    }
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  // Tính số ngày trong tháng được chọn
  const daysInMonthCount = new Date(year, month, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  // Ngày đầu tháng rơi vào thứ mấy (0: CN, 1: T2, ..., 6: T7)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  // Chuyển sang chuẩn T2 = 0, T3 = 1, ..., CN = 6
  const mondayOffset = (firstDayOfWeek + 6) % 7;
  const emptyDaysBefore = Array.from({ length: mondayOffset });

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
    setSelectedDay(1);
  };

  const handleConfirm = () => {
    const formattedDay = selectedDay.toString().padStart(2, "0");
    const formattedMonth = month.toString().padStart(2, "0");
    onSelectDate(`${formattedDay}/${formattedMonth}/${year}`);
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
        {/* Tiêu đề tháng năm và nút chuyển tháng */}
        <div className="flex items-center justify-between w-full mb-4 px-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#666666] hover:bg-[#FAF6EE] cursor-pointer"
            aria-label="Tháng trước"
          >
            ‹
          </button>
          <h3 className="text-[#D1342C] font-bold text-[18px] text-center">
            Tháng {month}, {year}
          </h3>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#666666] hover:bg-[#FAF6EE] cursor-pointer"
            aria-label="Tháng sau"
          >
            ›
          </button>
        </div>

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
