import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getAuthHeader } from "../services/authService";
import { API_URL } from "../config/api";

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// Flattens a backend cart item into the shape the UI expects
const normalizeItem = (apiItem) => ({
  cartItemId: apiItem._id.toString(),
  _id: apiItem.product._id,
  id: apiItem.product._id,
  name: apiItem.product.name,
  image: apiItem.product.image,
  price: apiItem.product.price,
  category: apiItem.product.category,
  sizes: apiItem.product.sizes,
  brand: apiItem.product.brand,
  condition: apiItem.product.condition,
  size: apiItem.size,
  quantity: apiItem.quantity,
});

const localItemKey = (item) => `${item._id ?? item.id}-${item.size}`;

export const AppProvider = ({ children }) => {
  const { auth } = useAuth();

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cartData");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist local cart only when the user is not authenticated
  useEffect(() => {
    if (!auth) {
      localStorage.setItem("cartData", JSON.stringify(cart));
    }
  }, [cart, auth]);

  // Sync cart whenever auth state changes
  useEffect(() => {
    if (auth) {
      syncCartOnLogin();
    } else {
      // Restore from localStorage on logout
      const saved = localStorage.getItem("cartData");
      setCart(saved ? JSON.parse(saved) : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const fetchServerCart = async () => {
    const res = await fetch(`${API_URL}/cart`, { headers: getAuthHeader() });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(normalizeItem);
  };

  // On login: merge any local cart items into the server cart, then load from server
  const syncCartOnLogin = async () => {
    try {
      const localRaw = localStorage.getItem("cartData");
      const localItems = localRaw ? JSON.parse(localRaw) : [];

      for (const item of localItems) {
        await fetch(`${API_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({
            product: item._id ?? item.id,
            size: item.size,
            quantity: item.quantity,
          }),
        });
      }

      localStorage.removeItem("cartData");
      const items = await fetchServerCart();
      setCart(items);
    } catch {
      // Keep local cart if sync fails; do not clear it
    }
  };

  const addToCart = async (product, size) => {
    if (auth) {
      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({ product: product._id, size, quantity: 1 }),
        });
        const data = await res.json();
        setCart((data.items || []).map(normalizeItem));
      } catch {
        // Silently fail — user sees no cart update
      }
    } else {
      const entry = { ...product, size };
      setCart((prev) => {
        const already = prev.find((i) => localItemKey(i) === localItemKey(entry));
        if (already) {
          return prev.map((i) =>
            localItemKey(i) === localItemKey(entry)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prev, { ...entry, quantity: 1 }];
      });
    }
  };

  const updateQuantity = async (id, size, qty) => {
    if (qty < 1) return;
    if (auth) {
      try {
        const target = cart.find(
          (i) => (i._id?.toString() ?? i.id?.toString()) === id?.toString() && i.size === size
        );
        if (!target?.cartItemId) return;
        const res = await fetch(`${API_URL}/cart/${target.cartItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({ quantity: qty }),
        });
        const data = await res.json();
        setCart((data.items || []).map(normalizeItem));
      } catch {
        // Silently fail
      }
    } else {
      setCart((prev) =>
        prev.map((i) =>
          (i._id ?? i.id) === id && i.size === size ? { ...i, quantity: qty } : i
        )
      );
    }
  };

  const removeFromCart = async (id, size) => {
    if (auth) {
      try {
        const target = cart.find(
          (i) => (i._id?.toString() ?? i.id?.toString()) === id?.toString() && i.size === size
        );
        if (!target?.cartItemId) return;
        const res = await fetch(`${API_URL}/cart/${target.cartItemId}`, {
          method: "DELETE",
          headers: getAuthHeader(),
        });
        const data = await res.json();
        setCart((data.items || []).map(normalizeItem));
      } catch {
        // Silently fail
      }
    } else {
      setCart((prev) =>
        prev.filter((i) => !((i._id ?? i.id) === id && i.size === size))
      );
    }
  };

  const clearCart = async () => {
    if (auth) {
      try {
        await fetch(`${API_URL}/cart`, {
          method: "DELETE",
          headers: getAuthHeader(),
        });
      } catch {
        // Silently fail
      }
    } else {
      localStorage.removeItem("cartData");
    }
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </AppContext.Provider>
  );
};
