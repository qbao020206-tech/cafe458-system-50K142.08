export interface Dish {
  ma_mon: number;
  ten_mon: string;
  gia_ban: number;
  hinh_anh: string | null;
  trang_thai: "Hiển thị" | "Ẩn";
  da_xoa?: boolean;
  ban_chay?: boolean;
}

export interface RecommendedDish extends Dish {
  rank?: number; // 1, 2, 3 [QĐ-18]
}

export interface CustomerMenuResponse {
  ma_ban: number;
  so_ban: string;
  menu: Dish[];
}

export interface TableMenuResponse {
  so_ban: string;
  ma_ban: number;
  mon_de_cu: RecommendedDish[];
  tat_ca_mon: Dish[];
}
