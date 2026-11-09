import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "../contexts/CartContext";
import { MenuPage } from "../pages/customer/MenuPage";
import { CheckoutPage } from "../pages/customer/CheckoutPage";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
};
