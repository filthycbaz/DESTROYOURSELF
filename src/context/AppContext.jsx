import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ▀▀▀ 1) Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("cartData");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // ▀▀▀ 2) Guardar carrito cuando cambie
  useEffect(() => {
    localStorage.setItem("cartData", JSON.stringify(cart));
  }, [cart]);

  // ▀▀▀ 3) Agregar producto (con talla)
  const addToCart = (product) => {
    setCart((prev) => {
      const already = prev.find(
        (item) => item.id === product.id && item.size === product.size
      );

      if (already) {
        return prev.map((item) =>
          item.id === product.id && item.size === product.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ▀▀▀ 4) Cambiar cantidad
  const updateQuantity = (id, size, qty) => {
    if (qty < 1) return; // no permitir 0 o negativos
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  // ▀▀▀ 5) Eliminar producto (por id + talla)
  const removeFromCart = (id, size) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size))
    );
  };

  // ▀▀▀ 6) Vaciar carrito (para checkout)
  const clearCart = () => setCart([]);

  // (opcional por ahora, útil para la parte de login)
  const user = null;

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        user, // ← lo dejamos aquí para que CartPage no truene
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
