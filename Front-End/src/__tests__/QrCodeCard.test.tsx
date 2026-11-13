import { createRef } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QrCodeCard, QrCodeCardRef } from "../components/common/QrCodeCard";
import api from "../services/api";

vi.mock("../services/api");

describe("QrCodeCard component", () => {
  const fakeBlob = new Blob(["fake-image-bytes"], { type: "image/png" });

  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/fake-blob");
    window.URL.revokeObjectURL = vi.fn();
    vi.mocked(api.get).mockResolvedValue({
      data: fakeBlob,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches QR image and renders img tag with data/blob URL", async () => {
    render(<QrCodeCard tableId="05" tableNumericId={5} size={180} />);

    // Initially displays loading state
    expect(screen.getByText("Đang tạo mã QR...")).toBeInTheDocument();

    // After loading, image should be rendered
    await waitFor(() => {
      const img = screen.getByAltText("Mã QR Bàn 05");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "blob:http://localhost/fake-blob");
    });
  });

  it("uses navigator.share when available on mobile devices", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    const canShareMock = vi.fn().mockReturnValue(true);

    Object.defineProperty(navigator, "share", {
      value: shareMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, "canShare", {
      value: canShareMock,
      configurable: true,
      writable: true,
    });

    const ref = createRef<QrCodeCardRef>();
    render(<QrCodeCard ref={ref} tableId="08" tableNumericId={8} />);

    await waitFor(() => {
      expect(screen.getByAltText("Mã QR Bàn 08")).toBeInTheDocument();
    });

    const result = await ref.current?.download();
    expect(result).toBe(true);
    expect(canShareMock).toHaveBeenCalled();
    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Mã QR Bàn 08",
      })
    );
  });

  it("falls back to anchor download when navigator.share is not available", async () => {
    // Delete navigator.share to simulate desktop browser
    // @ts-expect-error test override
    delete navigator.share;
    // @ts-expect-error test override
    delete navigator.canShare;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

    const ref = createRef<QrCodeCardRef>();
    render(<QrCodeCard ref={ref} tableId="09" tableNumericId={9} />);

    await waitFor(() => {
      expect(screen.getByAltText("Mã QR Bàn 09")).toBeInTheDocument();
    });

    const result = await ref.current?.download();
    expect(result).toBe(true);
    expect(clickSpy).toHaveBeenCalled();
  });
});
