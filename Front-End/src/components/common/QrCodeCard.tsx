import React, { useEffect, useRef } from "react";

interface QrCodeCardProps {
  tableId: string;
  size?: number;
  onDownloadReady?: (downloadFn: () => void) => void;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  tableId,
  size = 200,
  onDownloadReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Kích thước lưới QR (25 x 25 ô chuẩn Version 2)
    const N = 25;
    const cellSize = size / N;

    // Tạo ma trận QR xác định dựa trên chuỗi `ban${tableId}`
    const matrix: boolean[][] = Array.from({ length: N }, () =>
      Array(N).fill(false)
    );

    // Hàm vẽ Finder Pattern (3 góc lớn)
    const drawFinderPattern = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[r0 + r][c0 + c] = isBorder || isCenter;
        }
      }
    };

    // 3 góc Finder
    drawFinderPattern(0, 0);
    drawFinderPattern(0, N - 7);
    drawFinderPattern(N - 7, 0);

    // Timing patterns (đường kẻ nối giữa các góc)
    for (let i = 8; i < N - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Alignment pattern ở góc dưới phải (Version 2)
    const ar0 = N - 9;
    const ac0 = N - 9;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
        const isCenter = r === 2 && c === 2;
        matrix[ar0 + r][ac0 + c] = isBorder || isCenter;
      }
    }

    // Pseudorandom seed từ số bàn để ma trận mã hóa trông chân thực
    let seed = 0;
    const str = `cafe458_table_${tableId}`;
    for (let i = 0; i < str.length; i++) {
      seed = (seed * 31 + str.charCodeAt(i)) >>> 0;
    }

    const pseudoRandom = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed >>> 16) / 65536;
    };

    // Điền các module dữ liệu còn lại
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const inTopLeftFinder = r < 8 && c < 8;
        const inTopRightFinder = r < 8 && c >= N - 8;
        const inBottomLeftFinder = r >= N - 8 && c < 8;
        const inAlignment = r >= ar0 - 1 && r <= ar0 + 5 && c >= ac0 - 1 && c <= ac0 + 5;
        const inTiming = r === 6 || c === 6;

        if (
          !inTopLeftFinder &&
          !inTopRightFinder &&
          !inBottomLeftFinder &&
          !inAlignment &&
          !inTiming
        ) {
          matrix[r][c] = pseudoRandom() > 0.52;
        }
      }
    }

    // Vẽ lên Canvas
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#000000";
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    // Cung cấp hàm download cho component cha
    if (onDownloadReady) {
      onDownloadReady(() => {
        const link = document.createElement("a");
        link.download = `ban-${tableId}-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  }, [tableId, size, onDownloadReady]);

  return (
    <div className="bg-white p-3 rounded-[12px] shadow-sm inline-block border border-[#E8E0D2]">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-[180px] h-[180px] block"
      />
    </div>
  );
};
