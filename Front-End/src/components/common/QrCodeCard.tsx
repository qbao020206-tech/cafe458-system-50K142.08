import { useEffect, useState, useImperativeHandle, forwardRef, useRef } from "react";
import api from "../../services/api";

export interface QrCodeCardRef {
  download: () => Promise<boolean>;
}

interface QrCodeCardProps {
  tableNumericId?: number;
  tableId: string;
  size?: number;
}

const safeCreateObjectURL = (blob: Blob): string => {
  if (typeof window !== "undefined" && window.URL && typeof window.URL.createObjectURL === "function") {
    try {
      return window.URL.createObjectURL(blob);
    } catch {
      return "";
    }
  }
  return "";
};

const safeRevokeObjectURL = (url: string): void => {
  if (
    typeof window !== "undefined" &&
    window.URL &&
    typeof window.URL.revokeObjectURL === "function" &&
    url.startsWith("blob:")
  ) {
    try {
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
};

export const QrCodeCard = forwardRef<QrCodeCardRef, QrCodeCardProps>(
  ({ tableNumericId, tableId, size = 180 }, ref) => {
    const [qrBlob, setQrBlob] = useState<Blob | null>(null);
    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    // Lưu các blob url tạm thời để thu hồi an toàn
    const createdBlobUrls = useRef<string[]>([]);

    const targetId = tableNumericId ?? tableId;

    useEffect(() => {
      let active = true;

      const fetchQr = async () => {
        try {
          setLoading(true);
          setError(false);
          const res = await api.get(`/admin/tables/${targetId}/qr-image`, {
            responseType: "blob",
          });
          if (!active) return;

          const blob: Blob = res.data;
          setQrBlob(blob);

          const objUrl = safeCreateObjectURL(blob);
          if (objUrl) {
            createdBlobUrls.current.push(objUrl);
            setBlobUrl(objUrl);
          }

          // Chuyển blob sang Base64 Data URL tối ưu cho thiết bị di động
          // (cho phép nhấn giữ ảnh để 'Lưu vào Ảnh' trên iOS Safari / Android)
          if (typeof FileReader !== "undefined") {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (active && typeof reader.result === "string") {
                setDataUrl(reader.result);
              }
            };
            reader.readAsDataURL(blob);
          }
        } catch (err) {
          if (!active) return;
          console.error("Failed to fetch QR image:", err);
          setError(true);
        } finally {
          if (active) setLoading(false);
        }
      };

      fetchQr();

      return () => {
        active = false;
        // Thu hồi các blob url sau 30 giây để tránh hủy URL khi trình duyệt di động đang tiến hành lưu tệp
        const urlsToRevoke = [...createdBlobUrls.current];
        setTimeout(() => {
          urlsToRevoke.forEach(safeRevokeObjectURL);
        }, 30000);
      };
    }, [targetId]);

    useImperativeHandle(
      ref,
      () => ({
        download: async (): Promise<boolean> => {
          if (!qrBlob && !dataUrl) return false;

          const fileName = `QR_Ban_${tableId}.png`;
          const activeBlob =
            qrBlob || (dataUrl ? await (await fetch(dataUrl)).blob() : null);
          if (!activeBlob) return false;

          // 1. Thử dùng Web Share API (Level 2: file sharing)
          // Phương thức tối ưu nhất cho thiết bị di động (iPhone / Android)
          // Cho phép lưu trực tiếp vào Photos (Lưu hình ảnh), Tệp (Files) hoặc chia sẻ qua Zalo
          if (
            typeof navigator !== "undefined" &&
            typeof navigator.share === "function"
          ) {
            try {
              const file = new File([activeBlob], fileName, {
                type: "image/png",
              });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: `Mã QR Bàn ${tableId}`,
                  text: `Mã QR Bàn ${tableId} - Cà phê 458`,
                });
                return true;
              }
            } catch (err: unknown) {
              // Người dùng chủ động đóng hộp thoại Share thì không coi là lỗi tải
              if (err instanceof Error && err.name === "AbortError") {
                return false;
              }
              console.warn("navigator.share failed, trying fallback:", err);
            }
          }

          // 2. Phương thức tải trực tiếp qua thẻ <a>
          // Dùng cho máy tính Desktop & trình duyệt Android hỗ trợ thuộc tính download
          try {
            const downloadUrl =
              dataUrl || blobUrl || safeCreateObjectURL(activeBlob);
            if (!downloadUrl) return false;

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = fileName;
            link.target = "_self";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (
              downloadUrl.startsWith("blob:") &&
              !createdBlobUrls.current.includes(downloadUrl)
            ) {
              createdBlobUrls.current.push(downloadUrl);
            }
            return true;
          } catch (err) {
            console.error("Direct download failed:", err);

            // 3. Fallback: Mở ảnh trực tiếp để người dùng nhấn giữ lưu ảnh
            if (dataUrl) {
              const w = window.open("");
              if (w) {
                w.document.write(
                  `<img src="${dataUrl}" alt="${fileName}" style="max-width:100%;height:auto;"/>`
                );
                return true;
              }
            }
            return false;
          }
        },
      }),
      [qrBlob, dataUrl, blobUrl, tableId]
    );

    if (loading) {
      return (
        <div
          style={{ width: size, height: size }}
          className="bg-white p-3 rounded-[12px] shadow-sm flex items-center justify-center border border-[#E8E0D2] text-[#666666] text-[13px]"
        >
          Đang tạo mã QR...
        </div>
      );
    }

    if (error || (!dataUrl && !blobUrl)) {
      return (
        <div
          style={{ width: size, height: size }}
          className="bg-white p-3 rounded-[12px] shadow-sm flex items-center justify-center border border-[#E8E0D2] text-red-500 text-[13px]"
        >
          Không tải được mã QR
        </div>
      );
    }

    const imageSource = dataUrl || blobUrl || "";

    return (
      <div className="bg-white p-3 rounded-[12px] shadow-sm inline-block border border-[#E8E0D2] text-center">
        <img
          src={imageSource}
          alt={`Mã QR Bàn ${tableId}`}
          style={{
            width: size,
            height: size,
            WebkitTouchCallout: "default",
          }}
          className="block object-contain mx-auto"
        />
      </div>
    );
  }
);
