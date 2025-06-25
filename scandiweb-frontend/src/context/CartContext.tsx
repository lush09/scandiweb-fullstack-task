import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "../components/CartOverlay";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (
    id: string,
    attributes: { [attrName: string]: string },
  ) => void;
  updateQuantity: (
    id: string,
    quantity: number,
    attributes: { [attrName: string]: string },
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
  const stored = localStorage.getItem("cart");
  return stored ? JSON.parse(stored) : [];
});

  // Persist cartItems to localStorage on every change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const found = prev.find(
        (i) =>
          i.id === item.id &&
          JSON.stringify(i.attributes) === JSON.stringify(item.attributes),
      );
      if (found) {
        return prev.map((i) =>
          i.id === item.id &&
          JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (
    id: string,
    attributes: { [attrName: string]: string },
  ) => {
    setCartItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.id === id &&
            JSON.stringify(i.attributes) === JSON.stringify(attributes)
          ),
      ),
    );
  };

  const updateQuantity = (
    id: string,
    quantity: number,
    attributes: { [attrName: string]: string },
  ) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.id === id &&
          JSON.stringify(i.attributes) === JSON.stringify(attributes)
            ? { ...i, quantity }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
