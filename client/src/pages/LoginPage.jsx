import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || "/";
  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const result = isLogin
      ? await login(email, password)
      : await register(name, email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(redirectTo);
  };

  const handleToggleMode = () => {
    setMode(isLogin ? "register" : "login");
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
  };

  return (
    <div className="login-container">
      <h1 className="login-title">
        {isLogin ? "INICIAR SESIÓN" : "CREAR CUENTA"}
      </h1>

      <form onSubmit={handleSubmit} className="login-form" data-testid={isLogin ? "login-form" : "register-form"}>

        {!isLogin && (
          <div className="login-form-group">
            <label className="login-label" htmlFor="auth-name">Nombre</label>
            <input
              id="auth-name"
              type="text"
              className="login-input"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="register-name-input"
            />
          </div>
        )}

        <div className="login-form-group">
          <label className="login-label" htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            className="login-input"
            placeholder="usuario@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid={isLogin ? "login-email-input" : "register-email-input"}
          />
        </div>

        <div className="login-form-group">
          <label className="login-label" htmlFor="auth-password">Contraseña</label>
          <input
            id="auth-password"
            type="password"
            className="login-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid={isLogin ? "login-password-input" : "register-password-input"}
          />
        </div>

        {!isLogin && (
          <div className="login-form-group">
            <label className="login-label" htmlFor="auth-confirm-password">Confirmar contraseña</label>
            <input
              id="auth-confirm-password"
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              data-testid="register-confirm-password-input"
            />
          </div>
        )}

        {error && <p className="login-error" data-testid="auth-error">{error}</p>}

        <button
          type="submit"
          className="login-submit-button"
          disabled={loading}
          data-testid={isLogin ? "login-submit-button" : "register-submit-button"}
        >
          {loading ? "..." : isLogin ? "CONTINUAR" : "CREAR CUENTA"}
        </button>
      </form>

      <p className="login-help-text">
        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
        {" "}
        <button
          className="login-toggle-button"
          onClick={handleToggleMode}
          type="button"
          data-testid="auth-toggle-mode-button"
        >
          {isLogin ? "Regístrate" : "Inicia sesión"}
        </button>
      </p>
    </div>
  );
}