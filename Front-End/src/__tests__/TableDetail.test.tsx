import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TableDetailPage } from "../pages/admin/TableDetailPage";
import * as tableService from "../services/tableService";

vi.mock("../services/tableService");

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { username: "admin" },
    logout: vi.fn(),
  }),
}));

describe("TableDetailPage (U12 - UC_4.3, UC_4.4, AUD-01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'Xóa bàn' and hides 'Xác nhận bàn trống' when table is 'Trống'", async () => {
    vi.mocked(tableService.getTableById).mockResolvedValueOnce({
      id: "01",
      name: "Bàn 01",
      status: "Trống",
      numericId: 1,
    });

    render(
      <MemoryRouter initialEntries={["/admin/tables/01"]}>
        <Routes>
          <Route path="/admin/tables/:id" element={<TableDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Bàn 01")).toBeInTheDocument();
    });

    // Bàn trống: nút Xóa bàn hiển thị, nút Xác nhận bàn trống KHÔNG hiển thị
    expect(screen.getByRole("button", { name: "Xóa bàn" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xác nhận bàn trống" })).not.toBeInTheDocument();
  });

  it("shows 'Xác nhận bàn trống' and completely hides 'Xóa bàn' when table is 'Đang phục vụ' (BR-UC4-09, BR-UC4-11)", async () => {
    vi.mocked(tableService.getTableById).mockResolvedValueOnce({
      id: "02",
      name: "Bàn 02",
      status: "Đang phục vụ",
      numericId: 2,
    });

    render(
      <MemoryRouter initialEntries={["/admin/tables/02"]}>
        <Routes>
          <Route path="/admin/tables/:id" element={<TableDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Bàn 02")).toBeInTheDocument();
    });

    // Bàn đang phục vụ: nút Xác nhận bàn trống hiển thị, nút Xóa bàn bị ẨN HOÀN TOÀN
    expect(screen.getByRole("button", { name: "Xác nhận bàn trống" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa bàn" })).not.toBeInTheDocument();
  });
});
