import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { CartItem, PaymentMethod } from "../types/order";
import { Dish } from "../types/menu";

interface CartContextType {
  qrCode: string;
  tableNumber: string;
  items: CartItem[];
  note: string;
  paymentMethod: PaymentMethod;
  setTableSession: (qr: string, tableNum: string) => void;
  addItem: (dish: Dish | { ma_mon: number; ten_mon: string; gia_ban: number; hinh_anh?: string | null }) => void;
  updateQuantity: (maMon: number, quantity: number) => void;
  setNote: (note: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCart: () => void;
  totalQuantity: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [qrCode, setQrCode] = useState<string>(() => {
    return sessionStorage.getItem("cafe458_qr_code") || "";
  });
  const [tableNumber, setTableNumber] = useState<string>(() => {
    return sessionStorage.getItem("cafe458_table_number") || "";
  });
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem("cafe458_cart_items");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [note, setNote] = useState<string>(() => {
    return sessionStorage.getItem("cafe458_cart_note") || "";
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Chuyển khoản");

  useEffect(() => {
    sessionStorage.setItem("cafe458_qr_code", qrCode);
  }, [qrCode]);

  useEffect(() => {
    sessionStorage.setItem("cafe458_table_number", tableNumber);
  }, [tableNumber]);

  useEffect(() => {
    sessionStorage.setItem("cafe458_cart_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    sessionStorage.setItem("cafe458_cart_note", note);
  }, [note]);

  const setTableSession = (qr: string, tableNum: string) => {
    setQrCode(qr);
    setTableNumber(tableNum);
  };

  const addItem = (dish: Dish | { ma_mon: number; ten_mon: string; gia_ban: number; hinh_anh?: string | null }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.dish.ma_mon === dish.ma_mon);
      if (existing) {
        return prev.map((i) =>
          i.dish.ma_mon === dish.ma_mon
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          dish: {
            ma_mon: dish.ma_mon,
            ten_mon: dish.ten_mon,
            gia_ban: dish.gia_ban,
            hinh_anh: dish.hinh_anh || null,
          },
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (maMon: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.dish.ma_mon !== maMon);
      }
      return prev.map((i) =>
        i.dish.ma_mon === maMon ? { ...i, quantity } : i
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    setNote("");
  };

  const totalQuantity = useMemo(() => {
    return items.reduce((acc, cur) => acc + cur.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((acc, cur) => acc + cur.dish.gia_ban * cur.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        qrCode,
        tableNumber,
        items,
        note,
        paymentMethod,
        setTableSession,
        addItem,
        updateQuantity,
        setNote,
        setPaymentMethod,
        clearCart,
        totalQuantity,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
