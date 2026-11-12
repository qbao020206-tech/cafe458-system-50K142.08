export type RevenuePeriodType = "ngày" | "tháng" | "năm";

export interface RevenueSummaryItem {
  period: string; // "31/10/2026", "Tháng 10/2026", "2026"
  totalRevenue: number;
  rawKey?: string; // "2026-10-31" hoặc ISO
  periodType?: RevenuePeriodType;
}

export interface DishSalesStat {
  ma_mon?: number;
  dishName: string;
  quantity: number;
  isBestSeller?: boolean;
  ban_chay_nhat?: boolean;
}

export interface RevenueDetail {
  period: string;
  cashRevenue: number;
  transferRevenue: number;
  totalRevenue: number;
  totalCups: number;
  dishStats: DishSalesStat[];
}
