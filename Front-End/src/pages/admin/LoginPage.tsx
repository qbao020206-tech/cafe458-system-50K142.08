import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ModalConfirm } from "../../components/common/ModalConfirm";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Trạng thái lỗi validate
  const [usernameError, setUsernameError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);

  // Trạng thái popup lỗi đăng nhập sai (Bảng 53)
  const [loginFailedModal, setLoginFailedModal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUserEmpty = !username.trim();
    const isPassEmpty = !password.trim();

    setUsernameError(isUserEmpty);
    setPasswordError(isPassEmpty);

    if (isUserEmpty || isPassEmpty) {
      return;
    }

    try {
      setLoading(true);
      await login(username.trim(), password);
      // Đăng nhập thành công -> chuyển sang Trang chủ (U6)
      navigate("/admin");
    } catch {
      // Đăng nhập không thành công
      setLoginFailedModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#22201C] w-[390px] max-w-[390px] mx-auto relative flex flex-col font-['Be_Vietnam_Pro'] antialiased shadow-sm select-none overflow-hidden">
      {/* Header đỏ chuẩn Figma: cao 88px, Tiêu đề Đăng nhập căn giữa */}
      <header className="bg-[#D1342C] text-white h-[88px] px-[16px] flex items-center justify-center sticky top-0 z-30 flex-shrink-0">
        <h1 className="text-[24px] font-bold tracking-tight text-white leading-none">
          Đăng nhập
        </h1>
      </header>

      {/* Nội dung form */}
      <main className="flex-1 px-[20px] pt-[36px] relative z-10 flex flex-col justify-between">
        <form onSubmit={handleSubmit} noValidate>
          {/* Dòng chữ hướng dẫn màu đỏ chuẩn Figma */}
          <p className="text-[#D1342C] font-bold text-[18px] leading-snug mb-8">
            Vui lòng nhập thông tin tài khoản
            <br />
            để vào ứng dụng
          </p>

          {/* Ô nhập tên đăng nhập */}
          <div className="mb-4">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError && e.target.value.trim()) {
                  setUsernameError(false);
                }
              }}
              placeholder="Tên đăng nhập"
              className={`w-full h-[52px] px-[16px] bg-white rounded-[14px] text-[15px] text-[#22201C] placeholder-[#999999] focus:outline-none transition-colors ${
                usernameError
                  ? "border border-[#D1342C]"
                  : "border border-[#E8E0D2] focus:border-[#D1342C]/50"
              }`}
            />
            {usernameError && (
              <p className="text-[13px] text-[#D1342C] mt-1.5 font-medium">
                Không được để trống!
              </p>
            )}
          </div>

          {/* Ô nhập mật khẩu */}
          <div className="mb-8">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError && e.target.value.trim()) {
                    setPasswordError(false);
                  }
                }}
                placeholder="Mật khẩu"
                className={`w-full h-[52px] pl-[16px] pr-[48px] bg-white rounded-[14px] text-[15px] text-[#22201C] placeholder-[#999999] focus:outline-none transition-colors ${
                  passwordError
                    ? "border border-[#D1342C]"
                    : "border border-[#E8E0D2] focus:border-[#D1342C]/50"
                }`}
              />
              {/* Nút con mắt toggle hiện/ẩn mật khẩu */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 active:scale-90 transition-transform cursor-pointer"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
            {passwordError && (
              <p className="text-[13px] text-[#D1342C] mt-1.5 font-medium">
                Không được để trống!
              </p>
            )}
          </div>

          {/* Nút Đăng nhập: màu đỏ #D1342C chuẩn Figma */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] bg-[#D1342C] hover:bg-[#b82a23] disabled:opacity-60 text-white font-bold text-[16px] rounded-[14px] active:scale-95 transition-all shadow-none flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        {/* Hình nền mờ ly cà phê phía dưới chuẩn Figma (Bảng 49 STT 7) */}
        <div className="w-full flex justify-center items-end opacity-20 pointer-events-none mt-12 pb-4">
          <svg
            className="w-72 h-44 text-[#8C7A6B]"
            viewBox="0 0 240 140"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Đĩa lót ly */}
            <ellipse cx="120" cy="120" rx="90" ry="14" />
            {/* Thân ly to */}
            <path d="M50 40h140v50a40 40 0 0 1-40 40h-60a40 40 0 0 1-40-40V40z" />
            {/* Quai ly */}
            <path d="M190 55h16a18 18 0 0 1 0 36h-16" />
            {/* Khói cà phê */}
            <path d="M90 20c0-6 6-10 6-16m24 16c0-6 6-10 6-16m24 16c0-6 6-10 6-16" />
          </svg>
        </div>
      </main>

      {/* Popup lỗi đăng nhập không thành công (Bảng 53) */}
      <ModalConfirm
        isOpen={loginFailedModal}
        type="error"
        message="Đăng nhập không thành công!"
        onClose={() => setLoginFailedModal(false)}
      />
    </div>
  );
};
