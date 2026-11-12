import api from "./api";
import { Dish } from "../types/menu";

export interface AddDishPayload {
  ten_mon: string;
  gia_ban: number;
  hinh_anh?: string | null;
}

export interface UpdateDishPayload {
  ten_mon: string;
  gia_ban: number;
  hinh_anh?: string | null;
  trang_thai: "Hiển thị" | "Ẩn";
}

export interface UploadImageResponse {
  image_path: string;
  image_url: string;
}

export const getAdminDishes = async (): Promise<Dish[]> => {
  const response = await api.get<Dish[]>("/admin/menu");
  return response.data || [];
};

export const getDishById = async (id: number): Promise<Dish | null> => {
  const dishes = await getAdminDishes();
  const found = dishes.find((dish) => dish.ma_mon === id);
  return found || null;
};

export const uploadDishImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<UploadImageResponse>(
    "/admin/menu/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const addAdminDish = async (payload: AddDishPayload): Promise<Dish> => {
  const response = await api.post<{ message: string; [key: string]: any }>(
    "/admin/menu",
    {
      ten_mon: payload.ten_mon.trim(),
      gia_ban: payload.gia_ban,
      hinh_anh: payload.hinh_anh || null,
    }
  );
  return response.data as unknown as Dish;
};

export const updateAdminDish = async (
  id: number,
  payload: UpdateDishPayload
): Promise<Dish> => {
  // Back-End hỗ trợ PUT /admin/menu/{item_id}
  const response = await api.put<{ message: string; item: Dish }>(
    `/admin/menu/${id}`,
    {
      ten_mon: payload.ten_mon.trim(),
      gia_ban: payload.gia_ban,
      hinh_anh: payload.hinh_anh !== undefined ? payload.hinh_anh : null,
      trang_thai: payload.trang_thai,
    }
  );
  return response.data.item;
};

export const deleteAdminDish = async (id: number): Promise<boolean> => {
  await api.delete(`/admin/menu/${id}`);
  return true;
};
