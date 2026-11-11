import { TableItem } from "../types/table";

const STORAGE_KEY = "cafe458_admin_tables";

const DEFAULT_TABLES: TableItem[] = [
  { id: "01", name: "Bàn 01", status: "Trống" },
  { id: "02", name: "Bàn 02", status: "Trống" },
  { id: "03", name: "Bàn 03", status: "Đang phục vụ" },
  { id: "04", name: "Bàn 04", status: "Trống" },
  { id: "05", name: "Bàn 05", status: "Trống" },
  { id: "06", name: "Bàn 06", status: "Trống" },
  { id: "07", name: "Bàn 07", status: "Trống" },
  { id: "08", name: "Bàn 08", status: "Trống" },
];

const loadTablesFromStorage = (): TableItem[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read tables from sessionStorage:", err);
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TABLES));
  return DEFAULT_TABLES;
};

const saveTablesToStorage = (tables: TableItem[]): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  } catch (err) {
    console.error("Failed to save tables to sessionStorage:", err);
  }
};

export const getTables = async (): Promise<TableItem[]> => {
  const allTables = loadTablesFromStorage();
  return allTables
    .filter((table) => !table.isDeleted)
    .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
};

export const getTableById = async (id: string): Promise<TableItem | null> => {
  const allTables = loadTablesFromStorage();
  const found = allTables.find(
    (table) => (table.id === id || table.id === id.padStart(2, "0")) && !table.isDeleted
  );
  return found || null;
};

export const addTable = async (tableNumber: string): Promise<TableItem> => {
  const trimmed = tableNumber.trim();
  // BR-UC4-03: Số bàn không được để trống
  if (!trimmed) {
    const error = new Error("Không được để trống!");
    (error as any).field = "tableNumber";
    throw error;
  }

  // Định dạng 2 chữ số (ví dụ "9" -> "09")
  const formattedId = trimmed.length === 1 ? `0${trimmed}` : trimmed;
  const allTables = loadTablesFromStorage();

  // BR-UC4-04: Số bàn là duy nhất trong các bàn đang có trong sơ đồ (không tính bàn đã xóa)
  const isDuplicate = allTables.some(
    (table) => !table.isDeleted && (table.id === formattedId || table.id === trimmed)
  );

  if (isDuplicate) {
    const error = new Error("Số bàn đã tồn tại!");
    (error as any).field = "tableNumber";
    (error as any).isDuplicate = true;
    throw error;
  }

  // BR-UC4-06: Bàn mới mặc định ở trạng thái "Trống"
  const newTable: TableItem = {
    id: formattedId,
    name: `Bàn ${formattedId}`,
    status: "Trống",
  };

  allTables.push(newTable);
  saveTablesToStorage(allTables);
  return newTable;
};

export const deleteTable = async (id: string): Promise<boolean> => {
  const allTables = loadTablesFromStorage();
  const formattedId = id.padStart(2, "0");
  const index = allTables.findIndex(
    (table) => (table.id === id || table.id === formattedId) && !table.isDeleted
  );

  if (index === -1) {
    throw new Error("Không tìm thấy bàn");
  }

  // BR-UC4-08: Chỉ được xóa bàn ở trạng thái "Trống"
  if (allTables[index].status !== "Trống") {
    throw new Error("Chỉ được xóa bàn ở trạng thái Trống!");
  }

  // BR-UC4-10: Hệ thống chỉ đánh dấu xóa bàn
  allTables[index] = {
    ...allTables[index],
    isDeleted: true,
  };

  saveTablesToStorage(allTables);
  return true;
};

export const confirmEmptyTable = async (id: string): Promise<TableItem> => {
  const allTables = loadTablesFromStorage();
  const formattedId = id.padStart(2, "0");
  const index = allTables.findIndex(
    (table) => (table.id === id || table.id === formattedId) && !table.isDeleted
  );

  if (index === -1) {
    throw new Error("Không tìm thấy bàn");
  }

  // BR-UC4-02: Bàn chuyển về "Trống" khi chủ quán xác nhận bàn trống
  allTables[index] = {
    ...allTables[index],
    status: "Trống",
  };

  saveTablesToStorage(allTables);
  return allTables[index];
};

export const setTableServing = (tableId: string): void => {
  const allTables = loadTablesFromStorage();
  const formattedId = tableId.padStart(2, "0");
  const index = allTables.findIndex(
    (table) => (table.id === tableId || table.id === formattedId) && !table.isDeleted
  );
  if (index !== -1) {
    allTables[index] = {
      ...allTables[index],
      status: "Đang phục vụ",
    };
    saveTablesToStorage(allTables);
  }
};
