import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "../contexts/CartContext";
import { AuthProvider } from "../contexts/AuthContext";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

// Khách hàng (Customer)
import { MenuPage } from "../pages/customer/MenuPage";
import { CheckoutPage } from "../pages/customer/CheckoutPage";
import { PaymentTransferPage } from "../pages/customer/PaymentTransferPage";
import { PaymentCashPage } from "../pages/customer/PaymentCashPage";

// Chủ quán (Admin / Owner)
import { LoginPage } from "../pages/admin/LoginPage";
import { HomePage } from "../pages/admin/HomePage";
import { OrderListPage } from "../pages/admin/OrderListPage";
import { OrderDetailPage } from "../pages/admin/OrderDetailPage";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Phân hệ Khách hàng */}
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-transfer" element={<PaymentTransferPage />} />
            <Route path="/payment-cash" element={<PaymentCashPage />} />

            {/* Phân hệ Chủ quán: Đăng nhập */}
            <Route path="/login" element={<LoginPage />} />

            {/* Phân hệ Chủ quán: Trang được bảo vệ */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <OrderListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Chuyển hướng mặc định */}
            <Route path="*" element={<Navigate to="/menu" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
