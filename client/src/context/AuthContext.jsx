
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  login as loginService,
  logout as logoutService,
  register as registerService,
  getCurrentUser,
  isAuthenticated,
} from "../services/authService";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setAuth(isAuthenticated());
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginService(email, password);
    if (result.success) {
      setUser(result.user);
      setAuth(true);
    }
    return result;
  }, []);

  // REGISTER — misma forma que login, el service ya guarda en localStorage
  const register = useCallback(async (name, email, password) => {
    const result = await registerService(name, email, password);
    if (result.success) {
      setUser(result.user);
      setAuth(true);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
    setAuth(false);
  }, []);

  const value = useMemo(
    () => ({ user, auth, login, logout, register }),
    [user, auth, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
