import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { OrderDetailPage } from "../pages/admin/OrderDetailPage";
import * as adminOrderService from "../services/adminOrderService";

vi.mock("../services/adminOrderService");

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { username: "admin" },
    logout: vi.fn(),
  }),
}));

describe("OrderDetailPage (U8 - UC_2.1, UC_2.3, BR-UC2-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows both 'Xác nhận đã nhận tiền' and 'Xóa đơn' for unpaid orders", async () => {
    vi.mocked(adminOrderService.getOrderDetail).mockResolvedValueOnce({
      id: "0101",
      displayId: "#0101",
      numericId: 101,
      tableNumber: "01",
      date: "31/10/2026",
      time: "09:30",
      total: 35000,
      paymentMethod: "Tiền mặt",
      status: "Chưa xác nhận thanh toán",
      note: "Ít đường",
      items: [
        {
          name: "Cà phê sữa",
          quantity: 1,
          price: 35000,
          total: 35000,
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={["/admin/orders/0101"]}>
        <Routes>
          <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Đơn #0101")).toBeInTheDocument();
    });

    // Đơn Chưa xác nhận thanh toán: hiện cả 2 nút
    expect(screen.getByRole("button", { name: "Xác nhận đã nhận tiền" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa đơn" })).toBeInTheDocument();
  });

  it("hides 'Xác nhận đã nhận tiền' and keeps 'Xóa đơn' for paid orders (BR-UC2-03)", async () => {
    vi.mocked(adminOrderService.getOrderDetail).mockResolvedValueOnce({
      id: "0102",
      displayId: "#0102",
      numericId: 102,
      tableNumber: "02",
      date: "31/10/2026",
      time: "10:15",
      total: 55000,
      paymentMethod: "Chuyển khoản",
      status: "Đã xác nhận thanh toán",
      note: "",
      items: [
        {
          name: "Trà đào",
          quantity: 2,
          price: 27500,
          total: 55000,
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={["/admin/orders/0102"]}>
        <Routes>
          <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Đơn #0102")).toBeInTheDocument();
    });

    // Đơn Đã xác nhận thanh toán: ẩn nút Xác nhận đã nhận tiền, vẫn hiện nút Xóa đơn
    expect(screen.queryByRole("button", { name: "Xác nhận đã nhận tiền" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa đơn" })).toBeInTheDocument();
  });
});
