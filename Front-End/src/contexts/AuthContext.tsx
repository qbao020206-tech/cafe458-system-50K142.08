import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi } from "../services/authService";

interface AuthContextType {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (tenDangNhap: string, matKhau: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem("cafe458_token");
  });
  const [username, setUsername] = useState<string | null>(() => {
    return sessionStorage.getItem("cafe458_user");
  });

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("cafe458_token", token);
    } else {
      sessionStorage.removeItem("cafe458_token");
    }
  }, [token]);

  useEffect(() => {
    if (username) {
      sessionStorage.setItem("cafe458_user", username);
    } else {
      sessionStorage.removeItem("cafe458_user");
    }
  }, [username]);

  const login = async (tenDangNhap: string, matKhau: string) => {
    const data = await loginApi({
      ten_dang_nhap: tenDangNhap,
      mat_khau: matKhau,
    });
    setToken(data.token);
    setUsername(data.ten_dang_nhap);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    sessionStorage.removeItem("cafe458_token");
    sessionStorage.removeItem("cafe458_user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
