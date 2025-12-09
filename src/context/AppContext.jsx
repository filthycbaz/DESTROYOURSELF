import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('dys_cart');
    const savedUser = localStorage.getItem('dys_user');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('dys_cart', JSON.stringify(cart));
  }, [cart]);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('dys_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dys_user');
    }
  }, [user]);

  const addToCart = (product, size) => {
    const existingItem = cart.find(item => item.id === product.id && item.size === size);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, size, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
    } else {
      setCart(cart.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId, size) => {
    setCart(cart.filter(item => !(item.id === productId && item.size === size)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      cart,
      user,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};