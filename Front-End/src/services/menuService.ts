import api from "./api";
import { TableMenuResponse } from "../types/menu";
import { MESSAGES } from "../constants/messages";

// Dữ liệu mẫu khớp thiết kế Figma dùng khi chưa bật Back-End
const MOCK_MENU_DATA: TableMenuResponse = {
  so_ban: "03",
  ma_ban: 3,
  mon_de_cu: [
    {
      ma_mon: 1,
      ten_mon: "Bạc xỉu",
      gia_ban: 30000,
      hinh_anh: null,
      trang_thai: "Hiển thị",
      da_xoa: false,
      rank: 1,
    },
    {
      ma_mon: 2,
      ten_mon: "Cà phê sữa",
      gia_ban: 25000,
      hinh_anh: null,
      trang_thai: "Hiển thị",
      da_xoa: false,
      rank: 2,
    },
    {
      ma_mon: 3,
      ten_mon: "Cà phê đen",
      gia_ban: 20000,
      hinh_anh: null,
      trang_thai: "Hiển thị",
      da_xoa: false,
      rank: 3,
    },
  ],
  tat_ca_mon: [
    {
      ma_mon: 1,
      ten_mon: "Bạc xỉu",
      gia_ban: 30000,
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
      ten_mon: "Cà phê đen",
      gia_ban: 20000,
      hinh_anh: null,
      trang_thai: "Hiển thị",
      da_xoa: false,
    },
    {
      ma_mon: 4,
      ten_mon: "Sữa chua đá",
      gia_ban: 30000,
      hinh_anh: null,
      trang_thai: "Hiển thị",
      da_xoa: false,
    },
  ],
};

export const getMenuByQr = async (
  qrToken: string,
): Promise<TableMenuResponse> => {
  try {
    const response = await api.get<TableMenuResponse>("/customer/menu", {
      params: { qr: qrToken },
    });
    return response.data;
  } catch (error: any) {
    if (
      qrToken === "invalid" ||
      error?.response?.status === 404 ||
      error?.response?.data?.error?.code === "QR_INVALID"
    ) {
      const err = new Error(MESSAGES.QR_INVALID);
      (err as any).isQrInvalid = true;
      throw err;
    }
    // Nếu Back-End chưa chạy (offline/network error) và không phải cố tình test mã sai, trả mock
    if (!error.response && qrToken !== "invalid") {
      const match = qrToken.match(/\d+/);
      const tableNum = match ? match[0].padStart(2, "0") : "03";

      let tatCaMon = MOCK_MENU_DATA.tat_ca_mon;
      try {
        const stored = sessionStorage.getItem("cafe458_admin_menu");
        if (stored) {
          const parsed = JSON.parse(stored);
          const activeDishes = parsed.filter(
            (d: any) => !d.da_xoa && d.trang_thai === "Hiển thị"
          );
          if (activeDishes.length > 0) {
            tatCaMon = activeDishes;
          }
        }
      } catch {}

      return {
        ...MOCK_MENU_DATA,
        so_ban: tableNum,
        ma_ban: parseInt(tableNum, 10) || 3,
        tat_ca_mon: tatCaMon,
      };
    }
    throw error;
  }
};
