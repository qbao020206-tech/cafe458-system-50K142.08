import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PaymentTransferPage } from "../pages/customer/PaymentTransferPage";
import * as orderService from "../services/orderService";

const mockBase64Qr =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

vi.mock("../services/orderService");

vi.mock("../contexts/CartContext", () => ({
  useCart: () => ({
    qrCode: "qr_table_03",
    tableNumber: "03",
    items: [
      {
        dish: {
          ma_mon: 1,
          ten_mon: "Cà phê sữa đá",
          gia_ban: 25000,
        },
        quantity: 1,
      },
    ],
    note: "",
    totalQuantity: 1,
    totalAmount: 25000,
    clearCart: vi.fn(),
  }),
}));

describe("PaymentTransferPage (U3 - UC_7.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays Base64 QR from Back-End, transfer content BAN <so_ban>, and exact reminder message", async () => {
    vi.mocked(orderService.previewOrder).mockResolvedValueOnce({
      ma_ban: 3,
      so_ban: "03",
      items: [
        {
          ma_mon: 1,
          ten_mon: "Cà phê sữa đá",
          gia: 25000,
          so_luong: 1,
          thanh_tien: 25000,
        },
      ],
      total_amount: 25000,
      payment_method: "Chuyển khoản",
      payment_qr_url: mockBase64Qr,
      payment_message:
        "Sau khi chuyển khoản, nhấn Hoàn tất. Vui lòng chụp lại giao dịch để đối chiếu khi cần thiết",
    });

    render(
      <MemoryRouter>
        <PaymentTransferPage />
      </MemoryRouter>
    );

    // Kiểm tra ảnh QR hiển thị đúng từ Back-End Base64 data URL
    const qrImage = await screen.findByAltText("Mã QR Chuyển khoản");
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute("src", mockBase64Qr);

    // Kiểm tra nội dung chuyển khoản BAN <so_ban>
    expect(screen.getByText("BAN 03")).toBeInTheDocument();

    // Kiểm tra câu thông báo lời nhắc chuẩn nguyên văn
    expect(
      screen.getByText(
        "Sau khi chuyển khoản, nhấn Hoàn tất. Vui lòng chụp lại giao dịch để đối chiếu khi cần thiết"
      )
    ).toBeInTheDocument();
  });
});
