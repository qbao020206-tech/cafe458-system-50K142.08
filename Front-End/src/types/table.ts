export type TableStatus = "Trống" | "Đang phục vụ";

export interface TableItem {
  id: string; // "01", "02", "03", etc.
  name: string; // "Bàn 01", "Bàn 02", etc.
  status: TableStatus;
  qrCodeUrl?: string;
  isDeleted?: boolean;
}
