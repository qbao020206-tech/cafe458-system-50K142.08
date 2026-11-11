import { AdminOrder } from "../types/adminOrder";

const STORAGE_KEY = "cafe458_admin_orders";

const DEFAULT_ORDERS: AdminOrder[] = [
  {
    id: "0105",
    tableNumber: "05",
    date: "31/10/2026",
    time: "10:24",
    status: "Chưa xác nhận thanh toán",
    items: [
      {
        name: "Trà đào cam sả",
        price: 35000,
        quantity: 2,
        total: 70000,
      },
    ],
    total: 70000,
    paymentMethod: "Chuyển khoản",
    note: "Không lấy ống hút nhựa",
  },
  {
    id: "0103",
    tableNumber: "03",
    date: "31/10/2026",
    time: "10:20",
    status: "Chưa xác nhận thanh toán",
    items: [
      {
        name: "Bạc xỉu",
        price: 30000,
        quantity: 2,
        total: 60000,
      },
    ],
    total: 60000,
    paymentMethod: "Tiền mặt",
    note: "Ít đá, không đường",
  },
  {
    id: "0106",
    tableNumber: "06",
    date: "31/10/2026",
    time: "10:00",
    status: "Đã xác nhận thanh toán",
    items: [
      {
        name: "Cà phê sữa",
        price: 25000,
        quantity: 1,
        total: 25000,
      },
      {
        name: "Bạc xỉu",
        price: 30000,
        quantity: 1,
        total: 30000,
      },
    ],
    total: 55000,
    paymentMethod: "Tiền mặt",
    note: "Ít đá, không đường",
  },
  {
    id: "0109",
    tableNumber: "09",
    date: "31/10/2026",
    time: "10:00",
    status: "Đã xác nhận thanh toán",
    items: [
      {
        name: "Cà phê sữa",
        price: 25000,
        quantity: 1,
        total: 25000,
      },
      {
        name: "Bạc xỉu",
        price: 30000,
        quantity: 1,
        total: 30000,
      },
    ],
    total: 55000,
    paymentMethod: "Chuyển khoản",
    note: "Ít ngọt",
  },
  {
    id: "0102",
    tableNumber: "02",
    date: "31/10/2026",
    time: "09:32",
    status: "Đã xác nhận thanh toán",
    items: [
      {
        name: "Trà vải hoa hồng",
        price: 35000,
        quantity: 2,
        total: 70000,
      },
    ],
    total: 70000,
    paymentMethod: "Tiền mặt",
    note: "Nhiều đá",
  },
  {
    id: "0101",
    tableNumber: "01",
    date: "31/10/2026",
    time: "09:32",
    status: "Đã xác nhận thanh toán",
    items: [
      {
        name: "Cà phê đen",
        price: 20000,
        quantity: 3,
        total: 60000,
      },
    ],
    total: 60000,
    paymentMethod: "Tiền mặt",
    note: "Không đường",
  },
];

const loadOrdersFromStorage = (): AdminOrder[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read orders from sessionStorage:", err);
  }
  // Khởi tạo mặc định
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
  return DEFAULT_ORDERS;
};

const saveOrdersToStorage = (orders: AdminOrder[]): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Failed to save orders to sessionStorage:", err);
  }
};

export const getOrdersByDate = async (date: string): Promise<AdminOrder[]> => {
  const allOrders = loadOrdersFromStorage();
  return allOrders.filter((order) => order.date === date && !order.isDeleted);
};

export const getOrderDetail = async (id: string): Promise<AdminOrder | null> => {
  const allOrders = loadOrdersFromStorage();
  const found = allOrders.find((order) => order.id === id && !order.isDeleted);
  return found || null;
};

export const confirmPaymentOrder = async (id: string): Promise<AdminOrder> => {
  const allOrders = loadOrdersFromStorage();
  const orderIndex = allOrders.findIndex((order) => order.id === id);
  if (orderIndex === -1) {
    throw new Error("Không tìm thấy đơn hàng");
  }
  allOrders[orderIndex] = {
    ...allOrders[orderIndex],
    status: "Đã xác nhận thanh toán",
  };
  saveOrdersToStorage(allOrders);
  return allOrders[orderIndex];
};

export const deleteAdminOrder = async (id: string): Promise<boolean> => {
  const allOrders = loadOrdersFromStorage();
  const orderIndex = allOrders.findIndex((order) => order.id === id);
  if (orderIndex === -1) {
    throw new Error("Không tìm thấy đơn hàng");
  }
  // BR-UC2-08: Hệ thống chỉ đánh dấu xóa, không xóa hẳn dữ liệu đơn
  allOrders[orderIndex] = {
    ...allOrders[orderIndex],
    isDeleted: true,
  };
  saveOrdersToStorage(allOrders);
  return true;
};

export const getUnconfirmedCountSync = (): number => {
  const allOrders = loadOrdersFromStorage();
  return allOrders.filter(
    (order) => order.status === "Chưa xác nhận thanh toán" && !order.isDeleted
  ).length;
};

export const addCustomerOrder = (orderData: {
  tableNumber: string;
  items: { ma_mon: number; so_luong: number }[];
  paymentMethod: "Chuyển khoản" | "Tiền mặt";
  note?: string | null;
}): AdminOrder => {
  const allOrders = loadOrdersFromStorage();
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const newId = (allOrders.length + 101).toString().padStart(4, "0");

  let dishMap: Record<number, { name: string; price: number }> = {
    1: { name: "Bạc xỉu", price: 30000 },
    2: { name: "Cà phê sữa", price: 25000 },
    3: { name: "Cà phê đen", price: 20000 },
    4: { name: "Trà đào cam sả", price: 35000 },
    5: { name: "Nước ép cam", price: 30000 },
    6: { name: "Sữa chua đá", price: 25000 },
  };

  try {
    const rawMenu = sessionStorage.getItem("cafe458_admin_menu");
    if (rawMenu) {
      const parsedMenu = JSON.parse(rawMenu);
      parsedMenu.forEach((d: any) => {
        dishMap[d.ma_mon] = { name: d.ten_mon, price: d.gia_ban };
      });
    }
  } catch {}

  const orderItems = orderData.items.map((i) => {
    const dish = dishMap[i.ma_mon] || {
      name: `Món #${i.ma_mon}`,
      price: 30000,
    };
    return {
      name: dish.name,
      price: dish.price,
      quantity: i.so_luong,
      total: dish.price * i.so_luong,
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.total, 0);

  const newOrder: AdminOrder = {
    id: newId,
    tableNumber: orderData.tableNumber.padStart(2, "0"),
    date: "31/10/2026", // Khớp ngày xem mặc định trong flow quản lý đơn
    time: timeStr,
    status: "Chưa xác nhận thanh toán",
    items: orderItems,
    total: total || 60000,
    paymentMethod: orderData.paymentMethod,
    note: orderData.note || "",
  };

  const updatedOrders = [newOrder, ...allOrders];
  saveOrdersToStorage(updatedOrders);
  return newOrder;
};
