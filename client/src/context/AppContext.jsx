import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cartData");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartData", JSON.stringify(cart));
  }, [cart]);

  const itemKey = (item) => `${item._id ?? item.id}-${item.size}`;

  const addToCart = (product, size) => {
    const entry = { ...product, size };
    setCart((prev) => {
      const already = prev.find((item) => itemKey(item) === itemKey(entry));
      if (already) {
        return prev.map((item) =>
          itemKey(item) === itemKey(entry)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...entry, quantity: 1 }];
    });
  };

  const updateQuantity = (id, size, qty) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        (item._id ?? item.id) === id && item.size === size
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const removeFromCart = (id, size) => {
    setCart((prev) =>
      prev.filter((item) => !((item._id ?? item.id) === id && item.size === size))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        user: null,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
