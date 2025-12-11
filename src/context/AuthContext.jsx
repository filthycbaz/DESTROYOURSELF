import React, { createContext, useContext, useState, useEffect } from "react";
import { login as loginService, logout as logoutService, getCurrentUser, isAuthenticated } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);

  // Cargar usuario al iniciar
  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    setAuth(isAuthenticated());
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const result = await loginService(email, password);

    if (result.success) {
      setUser(result.user);
      setAuth(true);
    }

    return result;
  };

  // LOGOUT
  const logout = () => {
    logoutService();
    setUser(null);
    setAuth(false);
  };

  return (
    <AuthContext.Provider value={{ user, auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
