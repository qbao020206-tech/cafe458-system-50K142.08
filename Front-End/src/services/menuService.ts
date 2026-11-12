import api from "./api";
import { CustomerMenuResponse, TableMenuResponse } from "../types/menu";

export const getMenuByQr = async (
  qrToken: string
): Promise<TableMenuResponse> => {
  const token = (qrToken || "").trim();
  const response = await api.get<CustomerMenuResponse>("/customer/menu", {
    params: { qr: token, qr_token: token },
  });

  const data = response.data;
  const rawMenu = data.menu || [];

  // tat_ca_mon = menu.filter(item => item.trang_thai === "Hiển thị")
  const tat_ca_mon = rawMenu.filter((item) => item.trang_thai === "Hiển thị");

  // mon_de_cu = tat_ca_mon.filter(item => item.ban_chay).slice(0, 3) (QĐ-18)
  const mon_de_cu = tat_ca_mon
    .filter((item) => item.ban_chay)
    .slice(0, 3)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  return {
    ma_ban: data.ma_ban,
    so_ban: data.so_ban,
    tat_ca_mon,
    mon_de_cu,
  };
};
