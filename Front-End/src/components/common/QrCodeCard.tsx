import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import api from "../../services/api";

export interface QrCodeCardRef {
  download: () => void;
}

interface QrCodeCardProps {
  tableNumericId?: number;
  tableId: string;
  size?: number;
}

export const QrCodeCard = forwardRef<QrCodeCardRef, QrCodeCardProps>(
  ({ tableNumericId, tableId, size = 180 }, ref) => {
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const targetId = tableNumericId ?? tableId;

    useEffect(() => {
      let active = true;
      let currentBlobUrl = "";

      const fetchQr = async () => {
        try {
          setLoading(true);
          setError(false);
          const res = await api.get(`/admin/tables/${targetId}/qr-image`, {
            responseType: "blob",
          });
          if (!active) return;
          currentBlobUrl = URL.createObjectURL(res.data);
          setQrUrl(currentBlobUrl);
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
        if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
      };
    }, [targetId]);

    useImperativeHandle(
      ref,
      () => ({
        download: () => {
          if (!qrUrl) return;
          const link = document.createElement("a");
          link.href = qrUrl;
          link.download = `QR_Ban_${tableId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      }),
      [qrUrl, tableId]
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

    if (error || !qrUrl) {
      return (
        <div
          style={{ width: size, height: size }}
          className="bg-white p-3 rounded-[12px] shadow-sm flex items-center justify-center border border-[#E8E0D2] text-red-500 text-[13px]"
        >
          Không tải được mã QR
        </div>
      );
    }

    return (
      <div className="bg-white p-3 rounded-[12px] shadow-sm inline-block border border-[#E8E0D2]">
        <img
          src={qrUrl}
          alt={`Mã QR Bàn ${tableId}`}
          style={{ width: size, height: size }}
          className="block object-contain"
        />
      </div>
    );
  }
);
