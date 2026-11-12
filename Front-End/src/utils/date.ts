/**
 * Trả về ngày hiện tại theo định dạng hiển thị "DD/MM/YYYY" (múi giờ địa phương Việt Nam)
 */
export const getTodayFormatted = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Chuyển đổi định dạng "DD/MM/YYYY" sang "YYYY-MM-DD" cho API query
 */
export const toApiDateString = (displayDate: string): string => {
  if (displayDate.includes("-")) return displayDate;
  const parts = displayDate.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return displayDate;
};
