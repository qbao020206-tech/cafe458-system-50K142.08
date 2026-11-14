import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { addTable } from "../../services/tableService";
import { TableItem } from "../../types/table";
import { QrCodeCard, QrCodeCardRef } from "../../components/common/QrCodeCard";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { extractApiError } from "../../services/api";

export const AddTablePage: React.FC = () => {
  const navigate = useNavigate();

  const [tableNumber, setTableNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdTable, setCreatedTable] = useState<TableItem | null>(null);
  const qrCardRef = useRef<QrCodeCardRef | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const trimmed = tableNumber.trim();
    // Bắt lỗi bỏ trống trường "Số bàn" (UC 4.2 - Ngoại lệ 7a)
    if (!trimmed) {
      setErrorMessage("Không được để trống!");
      return;
    }

    try {
      const newTable = await addTable(trimmed);
      setCreatedTable(newTable);
    } catch (err: unknown) {
      const apiErr = extractApiError(err);
      if (
        apiErr.message === "Không được để trống!" ||
        (apiErr.field === "so_ban" && apiErr.code === "VALIDATION_ERROR")
      ) {
        setErrorMessage("Không được để trống!");
      } else if (
        apiErr.code === "DUPLICATE_TABLE" ||
        apiErr.message.includes("tồn tại") ||
        apiErr.message === "Số bàn đã tồn tại!"
      ) {
        setErrorMessage("Số bàn đã tồn tại!");
      } else {
        setSystemError(apiErr.message || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    }
  };

  const handleDownloadQr = async () => {
    if (!qrCardRef.current || isDownloading) return;
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const success = await qrCardRef.current.download();
      if (success) {
        setDownloadSuccess(true);
        // Sau khi tải mã QR xong quay về sơ đồ bàn (Bảng 99)
        setTimeout(() => {
          navigate("/admin/tables");
        }, 1200);
      }
    } catch (err) {
      console.error("Lỗi khi tải mã QR:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AdminLayout
      title="Quản lý bàn"
      showBackButton={true}
      onBackClick={() => navigate("/admin/tables")}
      noMainPadding={true}
      breadcrumb={
        <div className="flex items-center space-x-1.5 text-[14px]">
          <button
            type="button"
            onClick={() => navigate("/admin/tables")}
            className="text-[#D1342C] hover:underline cursor-pointer"
          >
            Quản lý bàn
          </button>
          <span className="text-[#666666]">&gt;&gt;</span>
          <span className="text-[#22201C] font-medium">Thêm bàn</span>
        </div>
      }
    >
      <div className="px-[16px] pt-4">
        {!systemError && (
          !createdTable ? (
            /* Màn hình nhập số bàn chuẩn Figma */
            <div className="bg-white border border-black rounded-2xl p-6 shadow-sm mt-12">
              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="tableNumberInput"
                  className="block font-semibold text-[16px] text-[#22201C] mb-2"
                >
                  Số bàn
                </label>

                <input
                  id="tableNumberInput"
                  type="text"
                  value={tableNumber}
                  onChange={(e) => {
                    setTableNumber(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className={`w-full h-[46px] px-3.5 rounded-[12px] border text-[16px] bg-white transition-colors focus:outline-none ${
                    errorMessage
                      ? "border-[#D1342C] focus:border-[#D1342C]"
                      : "border-[#CCCCCC] focus:border-[#2F5D50]"
                  }`}
                  placeholder=""
                  autoFocus
                />

                {/* Thông báo lỗi bỏ trống hoặc trùng số bàn */}
                {errorMessage && (
                  <p className="text-[#D1342C] text-[13px] mt-1.5 font-normal">
                    {errorMessage}
                  </p>
                )}

                {/* Hai nút Hủy & Lưu chuẩn Figma (căn phải, kích thước gọn gàng, bo góc đồng bộ) */}
                <div className="flex items-center justify-end gap-6 mt-9">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/tables")}
                    className="w-[84px] h-[42px] rounded-[12px] bg-white border-2 border-[#D1342C] text-[#D1342C] font-bold text-[16px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="w-[84px] h-[42px] rounded-[12px] bg-[#2F5D50] text-white font-bold text-[16px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Màn hình Thêm bàn thành công kèm mã QR riêng chuẩn UC 4.2 */
            <div className="flex flex-col items-center mt-4">
              {/* Hộp thông báo Thêm bàn thành công */}
              <div className="bg-white border border-black rounded-2xl p-5 shadow-sm text-center w-full mb-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-2 border-[#1E5642] flex items-center justify-center mb-3">
                  <svg
                    className="w-7 h-7 text-[#1E5642]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="font-bold text-[#1A1A1A] text-[17px]">
                  Thêm bàn thành công
                </p>
              </div>

              {/* Số bàn */}
              <h3 className="font-bold text-[18px] text-[#22201C] mb-3">
                Bàn {createdTable.id}
              </h3>

              {/* Mã QR riêng của bàn */}
              <QrCodeCard
                ref={qrCardRef}
                tableNumericId={createdTable.numericId}
                tableId={createdTable.id}
                size={180}
              />

              {/* Nút Tải mã QR */}
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={isDownloading}
                className="px-8 py-2.5 rounded-full bg-[#2F5D50] text-white font-bold text-[15px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm mt-6 disabled:opacity-75"
              >
                {isDownloading
                  ? "Đang lưu..."
                  : downloadSuccess
                  ? "Đã lưu mã QR thành công!"
                  : "Tải mã QR"}
              </button>
            </div>
          )
        )}
      </div>

      {/* Modal báo lỗi hệ thống */}
      <ModalConfirm
        isOpen={!!systemError}
        type="error"
        message={systemError}
        onClose={() => setSystemError(null)}
      />
    </AdminLayout>
  );
};
