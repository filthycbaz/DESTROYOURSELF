import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Si venías de checkout, volverás ahí después de iniciar sesión
  const redirectTo = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(redirectTo);
  };

  return (
    <div className="login-container">
      <h1 className="login-title">INICIAR SESIÓN</h1>

      <form onSubmit={handleSubmit} className="login-form">

        <div className="login-form-group">
          <label className="login-label">Email</label>
          <input
            type="email"
            className="login-input"
            placeholder="usuario@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-form-group">
          <label className="login-label">Contraseña</label>
          <input
            type="password"
            className="login-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-submit-button">
          CONTINUAR
        </button>
      </form>

      <p className="login-help-text">
        Usa las credenciales de ejemplo para continuar.
      </p>

      <p className="login-help-text">
        <b>Emails válidos:</b><br />
        cbaz2080@gmail.com / 123456<br />
        admin@example.com / admin123
      </p>
    </div>
  );
}
