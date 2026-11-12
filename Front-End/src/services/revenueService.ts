import api from "./api";
import {
  RevenuePeriodType,
  RevenueSummaryItem,
  RevenueDetail,
  DishSalesStat,
} from "../types/revenue";

const periodMap: Record<RevenuePeriodType, "day" | "month" | "year"> = {
  "ngày": "day",
  "tháng": "month",
  "năm": "year",
};

// Chuyển đổi chuỗi ISO/Date từ Back-End sang nhãn hiển thị tiếng Việt
const formatPeriodKey = (key: string, type: RevenuePeriodType): string => {
  try {
    const d = new Date(key);
    if (isNaN(d.getTime())) return key;
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    if (type === "ngày") {
      return `${day}/${month}/${year}`;
    }
    if (type === "tháng") {
      return `Tháng ${month}/${year}`;
    }
    if (type === "năm") {
      return `${year}`;
    }
  } catch {
    // fallback
  }
  return key;
};

// Chuyển đổi nhãn hiển thị sang date param cho API Back-End
export const parsePeriodToApiDate = (
  periodStr: string
): { period: "day" | "month" | "year"; date: string } => {
  const clean = decodeURIComponent(periodStr).trim();

  // Dạng Ngày: "31/10/2026"
  if (clean.includes("/") && clean.length === 10) {
    const [d, m, y] = clean.split("/");
    return {
      period: "day",
      date: `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`,
    };
  }
  // Dạng Tháng: "Tháng 10/2026"
  if (clean.startsWith("Tháng ") || clean.includes("tháng")) {
    const part = clean.replace(/Tháng\s*/i, "").trim();
    const [m, y] = part.split("/");
    return {
      period: "month",
      date: `${y}-${m.padStart(2, "0")}`,
    };
  }
  // Dạng Năm: "2026"
  if (/^\d{4}$/.test(clean)) {
    return {
      period: "year",
      date: clean,
    };
  }
  // Nếu đã ở dạng YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return {
      period: "day",
      date: clean,
    };
  }
  return {
    period: "day",
    date: clean,
  };
};

export const getRevenueSummary = async (
  type: RevenuePeriodType
): Promise<RevenueSummaryItem[]> => {
  const apiPeriod = periodMap[type] || "day";
  const response = await api.get<{
    period: string;
    items: { ky: string; doanh_thu: number }[];
  }>("/admin/reports/revenue", {
    params: { period: apiPeriod },
  });

  const rawItems = response.data?.items || [];
  return rawItems.map((item) => ({
    period: formatPeriodKey(item.ky, type),
    totalRevenue: item.doanh_thu,
    rawKey: item.ky,
    periodType: type,
  }));
};

export const getRevenueDetail = async (
  period: string
): Promise<RevenueDetail> => {
  const { period: apiPeriod, date: apiDate } = parsePeriodToApiDate(period);
  const response = await api.get<any>("/admin/reports/details", {
    params: {
      period: apiPeriod,
      date: apiDate,
    },
  });

  const data = response.data || {};
  const methods = data.doanh_thu_theo_phuong_thuc || {};
  const stats = data.thong_ke_ban_hang || {};
  const cacMon = stats.cac_mon || [];

  // BR-UC5-09: Lấy đồng hạng nếu có nhiều món có cùng số lượng bán nhiều nhất (nhận trực tiếp cờ ban_chay_nhat từ BE)
  const dishStats: DishSalesStat[] = cacMon.map((item: any) => ({
    ma_mon: item.ma_mon,
    dishName: item.ten_mon,
    quantity: item.so_luong,
    isBestSeller: Boolean(item.ban_chay_nhat),
    ban_chay_nhat: Boolean(item.ban_chay_nhat),
  }));

  return {
    period,
    cashRevenue: methods.tien_mat || 0,
    transferRevenue: methods.chuyen_khoan || 0,
    totalRevenue: methods.tong || 0,
    totalCups: stats.tong_so_ly || 0,
    dishStats,
  };
};
