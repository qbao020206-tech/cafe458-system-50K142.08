export type RevenuePeriodType = "ngày" | "tháng" | "năm";

export interface RevenueSummaryItem {
  period: string; // "31/10/2026", "Tháng 10/2026", "2026"
  totalRevenue: number;
}

export interface DishSalesStat {
  dishName: string;
  quantity: number;
  isBestSeller?: boolean;
}

export interface RevenueDetail {
  period: string;
  cashRevenue: number;
  transferRevenue: number;
  totalRevenue: number;
  totalCups: number;
  dishStats: DishSalesStat[];
}
