import {
  RevenuePeriodType,
  RevenueSummaryItem,
  RevenueDetail,
  DishSalesStat,
} from "../types/revenue";

const DAILY_REVENUE: RevenueSummaryItem[] = [
  { period: "31/10/2026", totalRevenue: 1250000 },
  { period: "30/10/2026", totalRevenue: 1250000 },
  { period: "29/10/2026", totalRevenue: 980000 },
  { period: "28/10/2026", totalRevenue: 1105000 },
  { period: "27/10/2026", totalRevenue: 760000 },
  { period: "26/10/2026", totalRevenue: 890000 },
  { period: "25/10/2026", totalRevenue: 1340000 },
  { period: "24/10/2026", totalRevenue: 710000 },
  { period: "23/10/2026", totalRevenue: 720000 },
  { period: "22/10/2026", totalRevenue: 890000 },
  { period: "21/10/2026", totalRevenue: 950000 },
];

const MONTHLY_REVENUE: RevenueSummaryItem[] = [
  { period: "Tháng 10/2026", totalRevenue: 28450000 },
  { period: "Tháng 9/2026", totalRevenue: 31200000 },
  { period: "Tháng 8/2026", totalRevenue: 29870000 },
  { period: "Tháng 7/2026", totalRevenue: 27640000 },
  { period: "Tháng 6/2026", totalRevenue: 30510000 },
];

const YEARLY_REVENUE: RevenueSummaryItem[] = [
  { period: "2026", totalRevenue: 295300000 },
  { period: "2025", totalRevenue: 268750000 },
];

export const getRevenueSummary = async (
  type: RevenuePeriodType
): Promise<RevenueSummaryItem[]> => {
  if (type === "ngày") return DAILY_REVENUE;
  if (type === "tháng") return MONTHLY_REVENUE;
  if (type === "năm") return YEARLY_REVENUE;
  return [];
};

export const getRevenueDetail = async (period: string): Promise<RevenueDetail> => {
  // Dữ liệu mẫu khớp 100% hình ảnh "2026, món bán chạy đồng hạng.png"
  if (period === "31/10/2026") {
    const rawDishStats: DishSalesStat[] = [
      { dishName: "Bạc xỉu", quantity: 15 },
      { dishName: "Cà phê sữa", quantity: 15 },
      { dishName: "Cà phê đen", quantity: 3 },
      { dishName: "Sữa chua đá", quantity: 2 },
      { dishName: "Nước chanh", quantity: 2 },
      { dishName: "Nước ép cam", quantity: 1 },
    ];

    // BR-UC5-09: Lấy đồng hạng nếu có nhiều món có cùng số lượng bán nhiều nhất
    const maxQty = Math.max(...rawDishStats.map((d) => d.quantity));
    const dishStats = rawDishStats.map((d) => ({
      ...d,
      isBestSeller: d.quantity === maxQty,
    }));

    return {
      period: "31/10/2026",
      cashRevenue: 820000,
      transferRevenue: 430000,
      totalRevenue: 1250000,
      totalCups: 38,
      dishStats,
    };
  }

  // Dự phòng cho các ngày/kỳ khác
  const allSummaries = [...DAILY_REVENUE, ...MONTHLY_REVENUE, ...YEARLY_REVENUE];
  const found = allSummaries.find((s) => s.period === period);
  const total = found ? found.totalRevenue : 1000000;
  const cashRevenue = Math.round((total * 0.65) / 10000) * 10000;
  const transferRevenue = total - cashRevenue;

  const rawDishStats: DishSalesStat[] = [
    { dishName: "Bạc xỉu", quantity: 18 },
    { dishName: "Cà phê sữa", quantity: 14 },
    { dishName: "Cà phê đen", quantity: 8 },
    { dishName: "Trà đào cam sả", quantity: 6 },
    { dishName: "Sữa chua đá", quantity: 4 },
  ];

  const maxQty = Math.max(...rawDishStats.map((d) => d.quantity));
  const dishStats = rawDishStats.map((d) => ({
    ...d,
    isBestSeller: d.quantity === maxQty,
  }));

  const totalCups = dishStats.reduce((sum, d) => sum + d.quantity, 0);

  return {
    period,
    cashRevenue,
    transferRevenue,
    totalRevenue: total,
    totalCups,
    dishStats,
  };
};
