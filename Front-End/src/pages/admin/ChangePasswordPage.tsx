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

    // Kiểm tra hai mật khẩu mới có trùng khớp không (BR-UC6-03)
    if (newPassword !== confirmPassword) {
      setConfirmPassError("Mật khẩu mới và mật khẩu nhập lại không giống nhau!");
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
      } else if (apiErr.field === "mat_khau_cu") {
        setOldPassError(apiErr.message || "Không được để trống!");
      } else if (apiErr.field === "mat_khau_moi") {
        setNewPassError(apiErr.message || "Không được để trống!");
      } else if (apiErr.field === "nhap_lai_mat_khau_moi") {
        setConfirmPassError(
          apiErr.message || "Mật khẩu mới và mật khẩu nhập lại không giống nhau!"
        );
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 active:scale-90 transition-transform cursor-pointer"
                aria-label={showOldPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 active:scale-90 transition-transform cursor-pointer"
                aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 active:scale-90 transition-transform cursor-pointer"
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
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