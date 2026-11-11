import { Dish } from "../types/menu";

const STORAGE_KEY = "cafe458_admin_menu";

const DEFAULT_DISHES: Dish[] = [
  {
    ma_mon: 1,
    ten_mon: "Cà phê đen",
    gia_ban: 20000,
    hinh_anh: null,
    trang_thai: "Hiển thị",
    da_xoa: false,
  },
  {
    ma_mon: 2,
    ten_mon: "Cà phê sữa",
    gia_ban: 25000,
    hinh_anh: null,
    trang_thai: "Hiển thị",
    da_xoa: false,
  },
  {
    ma_mon: 3,
    ten_mon: "Bạc xỉu",
    gia_ban: 30000,
    hinh_anh: null,
    trang_thai: "Hiển thị",
    da_xoa: false,
  },
  {
    ma_mon: 4,
    ten_mon: "Trà đào cam sả",
    gia_ban: 35000,
    hinh_anh: null,
    trang_thai: "Hiển thị",
    da_xoa: false,
  },
  {
    ma_mon: 5,
    ten_mon: "Nước ép cam",
    gia_ban: 30000,
    hinh_anh: null,
    trang_thai: "Ẩn",
    da_xoa: false,
  },
  {
    ma_mon: 6,
    ten_mon: "Sữa chua đá",
    gia_ban: 25000,
    hinh_anh: null,
    trang_thai: "Hiển thị",
    da_xoa: false,
  },
];

const loadDishesFromStorage = (): Dish[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read menu from sessionStorage:", err);
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DISHES));
  return DEFAULT_DISHES;
};

const saveDishesToStorage = (dishes: Dish[]): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
  } catch (err) {
    console.error("Failed to save menu to sessionStorage:", err);
  }
};

export const getAdminDishes = async (): Promise<Dish[]> => {
  const allDishes = loadDishesFromStorage();
  // BR-UC3-09: Món đã xóa không hiển thị trong danh sách quản lý menu
  return allDishes.filter((dish) => !dish.da_xoa);
};

export const getDishById = async (id: number): Promise<Dish | null> => {
  const allDishes = loadDishesFromStorage();
  const found = allDishes.find((dish) => dish.ma_mon === id && !dish.da_xoa);
  return found || null;
};

export interface AddDishPayload {
  ten_mon: string;
  gia_ban: number;
  hinh_anh?: string | null;
}

export const addAdminDish = async (payload: AddDishPayload): Promise<Dish> => {
  const allDishes = loadDishesFromStorage();
  const trimmedName = payload.ten_mon.trim();

  // BR-UC3-02: Tên món và giá bán không được để trống
  if (!trimmedName) {
    const err = new Error("Không được để trống!");
    (err as any).field = "ten_mon";
    throw err;
  }

  if (payload.gia_ban === undefined || payload.gia_ban === null || isNaN(payload.gia_ban)) {
    const err = new Error("Không được để trống!");
    (err as any).field = "gia_ban";
    throw err;
  }

  // BR-UC3-04: Giá bán là số lớn hơn 0
  if (payload.gia_ban <= 0) {
    const err = new Error("Giá bán phải là số lớn hơn 0!");
    (err as any).field = "gia_ban";
    throw err;
  }

  // BR-UC3-03: Tên món là duy nhất trong menu (không tính món đã xóa)
  const isDuplicate = allDishes.some(
    (dish) =>
      !dish.da_xoa && dish.ten_mon.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    const err = new Error("Tên món đã tồn tại!");
    (err as any).field = "ten_mon";
    throw err;
  }

  const newId =
    allDishes.length > 0 ? Math.max(...allDishes.map((d) => d.ma_mon)) + 1 : 1;

  const newDish: Dish = {
    ma_mon: newId,
    ten_mon: trimmedName,
    gia_ban: payload.gia_ban,
    hinh_anh: payload.hinh_anh || null,
    trang_thai: "Hiển thị", // Món mới mặc định ở trạng thái "Hiển thị" (Bảng 73)
    da_xoa: false,
  };

  // Món mới thêm hiện ở đầu danh sách (Bảng 76)
  const updatedDishes = [newDish, ...allDishes];
  saveDishesToStorage(updatedDishes);
  return newDish;
};

export interface UpdateDishPayload {
  ten_mon: string;
  gia_ban: number;
  hinh_anh?: string | null;
  trang_thai: "Hiển thị" | "Ẩn";
}

export const updateAdminDish = async (
  id: number,
  payload: UpdateDishPayload
): Promise<Dish> => {
  const allDishes = loadDishesFromStorage();
  const index = allDishes.findIndex((dish) => dish.ma_mon === id && !dish.da_xoa);

  if (index === -1) {
    throw new Error("Không tìm thấy món");
  }

  const trimmedName = payload.ten_mon.trim();

  // BR-UC3-02: Tên món và giá bán không được để trống
  if (!trimmedName) {
    const err = new Error("Không được để trống!");
    (err as any).field = "ten_mon";
    throw err;
  }

  if (payload.gia_ban === undefined || payload.gia_ban === null || isNaN(payload.gia_ban)) {
    const err = new Error("Không được để trống!");
    (err as any).field = "gia_ban";
    throw err;
  }

  // BR-UC3-04: Giá bán là số lớn hơn 0
  if (payload.gia_ban <= 0) {
    const err = new Error("Giá bán phải là số lớn hơn 0!");
    (err as any).field = "gia_ban";
    throw err;
  }

  // BR-UC3-03: Tên món là duy nhất trong menu
  const isDuplicate = allDishes.some(
    (dish) =>
      !dish.da_xoa &&
      dish.ma_mon !== id &&
      dish.ten_mon.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    const err = new Error("Tên món đã tồn tại!");
    (err as any).field = "ten_mon";
    throw err;
  }

  allDishes[index] = {
    ...allDishes[index],
    ten_mon: trimmedName,
    gia_ban: payload.gia_ban,
    hinh_anh: payload.hinh_anh !== undefined ? payload.hinh_anh : allDishes[index].hinh_anh,
    trang_thai: payload.trang_thai,
  };

  saveDishesToStorage(allDishes);
  return allDishes[index];
};

export const deleteAdminDish = async (id: number): Promise<boolean> => {
  const allDishes = loadDishesFromStorage();
  const index = allDishes.findIndex((dish) => dish.ma_mon === id && !dish.da_xoa);

  if (index === -1) {
    throw new Error("Không tìm thấy món");
  }

  // BR-UC3-07: Hệ thống chỉ đánh dấu xóa, không xóa hẳn dữ liệu món
  allDishes[index] = {
    ...allDishes[index],
    da_xoa: true,
  };

  saveDishesToStorage(allDishes);
  return true;
};
