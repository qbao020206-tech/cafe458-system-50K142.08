import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AxiosError, AxiosHeaders } from "axios";
import { LoginPage } from "../pages/admin/LoginPage";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

describe("LoginPage (U5 - UC_1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'Không được để trống!' under both inputs when submitting empty form", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole("button", { name: "Đăng nhập" });
    fireEvent.click(submitBtn);

    const errorMessages = await screen.findAllByText("Không được để trống!");
    expect(errorMessages).toHaveLength(2);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("shows 'Đăng nhập không thành công!' modal when login API returns 401", async () => {
    const error401 = new AxiosError(
      "Unauthorized",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        data: {
          error: {
            code: "UNAUTHORIZED",
            message: "Đăng nhập không thành công!",
            field: null,
          },
        },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );
    mockLogin.mockRejectedValueOnce(error401);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const userInput = screen.getByPlaceholderText("Tên đăng nhập");
    const passInput = screen.getByPlaceholderText("Mật khẩu");
    const submitBtn = screen.getByRole("button", { name: "Đăng nhập" });

    fireEvent.change(userInput, { target: { value: "admin_cafe458" } });
    fireEvent.change(passInput, { target: { value: "WrongPass123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin_cafe458", "WrongPass123!");
    });

    const modalText = await screen.findByText("Đăng nhập không thành công!");
    expect(modalText).toBeInTheDocument();
  });
});
