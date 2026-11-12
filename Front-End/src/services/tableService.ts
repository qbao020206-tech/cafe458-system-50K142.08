import api from "./api";
import { TableItem, TableStatus } from "../types/table";

interface ApiTable {
  ma_ban: number;
  so_ban: string;
  trang_thai: string;
  qr_download_url: string;
}

const mapApiTableToItem = (table: ApiTable): TableItem => ({
  id: table.so_ban.padStart(2, "0"),
  numericId: table.ma_ban,
  name: `Bàn ${table.so_ban.padStart(2, "0")}`,
  status: table.trang_thai as TableStatus,
  qrCodeUrl: table.qr_download_url,
});

export const getTables = async (): Promise<TableItem[]> => {
  const response = await api.get<ApiTable[]>("/admin/tables");
  const list = (response.data || []).map(mapApiTableToItem);
  return list.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
};

export const getTableById = async (id: string): Promise<TableItem | null> => {
  const tables = await getTables();
  const formattedId = id.padStart(2, "0");
  const found = tables.find(
    (t) =>
      t.id === id ||
      t.id === formattedId ||
      (t.numericId !== undefined && t.numericId.toString() === id)
  );
  return found || null;
};

export const addTable = async (tableNumber: string): Promise<TableItem> => {
  const trimmed = tableNumber.trim();
  const formattedNumber = trimmed.length === 1 ? `0${trimmed}` : trimmed;

  const response = await api.post<{
    ma_ban: number;
    so_ban: string;
    trang_thai: string;
    qr_download_url: string;
    message: string;
  }>("/admin/tables", {
    so_ban: formattedNumber,
  });

  return mapApiTableToItem(response.data);
};

export const deleteTable = async (id: string): Promise<boolean> => {
  const table = await getTableById(id);
  const tableId = table?.numericId ?? parseInt(id, 10);
  await api.delete(`/admin/tables/${tableId}`);
  return true;
};

export const confirmEmptyTable = async (id: string): Promise<TableItem> => {
  const table = await getTableById(id);
  const tableId = table?.numericId ?? parseInt(id, 10);
  await api.patch(`/admin/tables/${tableId}/empty`);
  const updated = await getTableById(id);
  if (!updated) {
    throw new Error("Không tìm thấy bàn");
  }
  return updated;
};

export const getTableQrDownloadUrl = (tableId: number | string): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
  return `${baseUrl}/admin/tables/${tableId}/qr-image`;
};
