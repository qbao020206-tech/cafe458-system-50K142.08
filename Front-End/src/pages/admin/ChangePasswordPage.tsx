import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useAuth } from "../../contexts/AuthContext";
import { changePasswordApi } from "../../services/authService";
import { ModalConfirm } from "../../components/common/ModalConfirm";
import { extractApiError } from "../../services/api";

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { clearSession } = useAuth();

  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [oldPassError, setOldPassError] = useState<string | null>(null);
  const [newPassError, setNewPassError] = useState<string | null>(null);
  const [confirmPassError, setConfirmPassError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [wrongOldPasswordModal, setWrongOldPasswordModal] = useState<boolean>(false);
  const [saveErrorModal, setSaveErrorModal] = useState<boolean>(false);
  const [mismatchModal, setMismatchModal] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasEmptyError = false;

    if (!oldPassword.trim()) {
      setOldPassError("Không được để trống!");
      hasEmptyError = true;
    } else {
      setOldPassError(null);
    }

    if (!newPassword.trim()) {
      setNewPassError("Không được để trống!");
      hasEmptyError = true;
    } else {
      setNewPassError(null);
    }

    if (!confirmPassword.trim()) {
      setConfirmPassError("Không được để trống!");
      hasEmptyError = true;
    } else {
      setConfirmPassError(null);
    }

    if (hasEmptyError) {
      return;
    }

    // Kiểm tra hai mật khẩu mới có trùng khớp không (BR-UC6-03, Figma UC 6)
    if (newPassword !== confirmPassword) {
      setConfirmPassError(null);
      setMismatchModal(true);
      return;
    }

    try {
      setLoading(true);
      await changePasswordApi({
        mat_khau_cu: oldPassword,
        mat_khau_moi: newPassword,
        nhap_lai_mat_khau_moi: confirmPassword,
      });

      // Thành công: xóa session và chuyển hướng về màn hình Đăng nhập kèm thông báo thành công (Bảng 127)
      clearSession();
      navigate("/login", {
        state: { successMessage: "Đổi mật khẩu thành công!" },
        replace: true,
      });
    } catch (err: unknown) {
      const apiErr = extractApiError(err);
      if (
        apiErr.code === "INVALID_OLD_PASSWORD" ||
        apiErr.message === "Mật khẩu cũ không đúng!"
      ) {
        setWrongOldPasswordModal(true);
      } else if (
        apiErr.code === "PASSWORD_MISMATCH" ||
        apiErr.message?.includes("không giống nhau")
      ) {
        setConfirmPassError(null);
        setMismatchModal(true);
      } else if (apiErr.field === "mat_khau_cu") {
        setOldPassError(apiErr.message || "Không được để trống!");
      } else if (apiErr.field === "mat_khau_moi") {
        setNewPassError(apiErr.message || "Không được để trống!");
      } else if (apiErr.field === "nhap_lai_mat_khau_moi") {
        if (apiErr.message?.includes("không giống nhau")) {
          setConfirmPassError(null);
          setMismatchModal(true);
        } else {
          setConfirmPassError(apiErr.message || "Không được để trống!");
        }
      } else {
        setSaveErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbNode = (
    <div className="flex items-center text-[14px]">
      <button
        type="button"
        onClick={() => navigate("/admin")}
        className="text-[#D1342C] hover:underline cursor-pointer font-medium"
      >
        Trang chủ
      </button>
      <span className="mx-2 text-[#22201C] font-semibold">&gt;&gt;</span>
      <span className="text-[#22201C] font-bold">Đổi mật khẩu</span>
    </div>
  );

  return (
    <AdminLayout
      title="Đổi mật khẩu"
      showBackButton={true}
      onBackClick={() => navigate("/admin")}
      breadcrumb={breadcrumbNode}
    >
      <div className="px-[20px]">
        {/* Dòng chữ hướng dẫn màu đỏ sẫm chuẩn Figma */}
        <h2 className="text-[#8A2424] font-bold text-[19px] leading-tight pt-2 mb-6">
          Vui lòng nhập thông tin tài khoản
          <br />
          để đổi mật khẩu
        </h2>

        <form onSubmit={handleSave} noValidate>
          {/* Ô nhập 1: Mật khẩu cũ */}
          <div className="mb-4">
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (oldPassError && e.target.value.trim()) {
                    setOldPassError(null);
                  }
                }}
                placeholder="Mật khẩu cũ"
                className={`w-full h-[52px] pl-[16px] pr-[48px] bg-white rounded-[14px] text-[15px] text-[#22201C] placeholder-[#666666] focus:outline-none transition-colors ${
                  oldPassError
                    ? "border border-[#D1342C]"
                    : "border border-[#79747E] focus:border-[#D1342C]/60"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#666666] hover:text-[#22201C] active:scale-90 transition-transform cursor-pointer"
                aria-label={showOldPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 32 30"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 2 9 C 7 0.5 25 0.5 30 9" />
                  <path d="M 2 17.5 C 7 5 25 5 30 17.5 C 25 30 7 30 2 17.5 Z" />
                  <circle cx="16" cy="17.5" r="4.2" />
                  {showOldPassword && <line x1="3" y1="27" x2="29" y2="3" />}
                </svg>
              </button>
            </div>
            {oldPassError && (
              <p className="text-[13px] text-[#D1342C] mt-1.5 font-medium">
                {oldPassError}
              </p>
            )}
          </div>

          {/* Ô nhập 2: Mật khẩu mới */}
          <div className="mb-4">
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPassError && e.target.value.trim()) {
                    setNewPassError(null);
                  }
                }}
                placeholder="Mật khẩu mới"
                className={`w-full h-[52px] pl-[16px] pr-[48px] bg-white rounded-[14px] text-[15px] text-[#22201C] placeholder-[#666666] focus:outline-none transition-colors ${
                  newPassError
                    ? "border border-[#D1342C]"
                    : "border border-[#79747E] focus:border-[#D1342C]/60"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#666666] hover:text-[#22201C] active:scale-90 transition-transform cursor-pointer"
                aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 32 30"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 2 9 C 7 0.5 25 0.5 30 9" />
                  <path d="M 2 17.5 C 7 5 25 5 30 17.5 C 25 30 7 30 2 17.5 Z" />
                  <circle cx="16" cy="17.5" r="4.2" />
                  {showNewPassword && <line x1="3" y1="27" x2="29" y2="3" />}
                </svg>
              </button>
            </div>
            {newPassError && (
              <p className="text-[13px] text-[#D1342C] mt-1.5 font-medium">
                {newPassError}
              </p>
            )}
          </div>

          {/* Ô nhập 3: Nhập lại mật khẩu mới */}
          <div className="mb-6">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPassError && e.target.value.trim()) {
                    setConfirmPassError(null);
                  }
                }}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full h-[52px] pl-[16px] pr-[48px] bg-white rounded-[14px] text-[15px] text-[#22201C] placeholder-[#666666] focus:outline-none transition-colors ${
                  confirmPassError
                    ? "border border-[#D1342C]"
                    : "border border-[#79747E] focus:border-[#D1342C]/60"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#666666] hover:text-[#22201C] active:scale-90 transition-transform cursor-pointer"
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 32 30"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 2 9 C 7 0.5 25 0.5 30 9" />
                  <path d="M 2 17.5 C 7 5 25 5 30 17.5 C 25 30 7 30 2 17.5 Z" />
                  <circle cx="16" cy="17.5" r="4.2" />
                  {showConfirmPassword && <line x1="3" y1="27" x2="29" y2="3" />}
                </svg>
              </button>
            </div>
            {confirmPassError && (
              <p className="text-[13px] text-[#D1342C] mt-1.5 font-medium">
                {confirmPassError}
              </p>
            )}
          </div>

          {/* Nút Lưu: màu đỏ #D1342C chuẩn Figma */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] bg-[#D1342C] hover:bg-[#b82a23] disabled:opacity-60 text-white font-bold text-[16px] rounded-[14px] active:scale-95 transition-all shadow-none flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Lưu</span>
            )}
          </button>
        </form>
      </div>

      {/* Popup lỗi hai mật khẩu mới không trùng khớp (Figma UC 6) */}
      <ModalConfirm
        isOpen={mismatchModal}
        type="error"
        message={"Mật khẩu mới và mật khẩu\nnhập lại không giống nhau!"}
        onClose={() => setMismatchModal(false)}
      />

      {/* Popup lỗi mật khẩu cũ sai (Bảng 125) */}
      <ModalConfirm
        isOpen={wrongOldPasswordModal}
        type="error"
        message="Mật khẩu cũ không đúng!"
        onClose={() => setWrongOldPasswordModal(false)}
      />

      {/* Popup lỗi lưu hệ thống (Bảng 126) */}
      <ModalConfirm
        isOpen={saveErrorModal}
        type="error"
        message="Có lỗi xảy ra, vui lòng thử lại!"
        onClose={() => setSaveErrorModal(false)}
      />
    </AdminLayout>
  );
};