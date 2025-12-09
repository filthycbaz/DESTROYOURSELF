import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './LoginPage.css'; // <-- IMPORTACIÓN CORRECTA

const LoginPage = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Por favor completa todos los campos');
      return;
    }
    login(formData);
    navigate('/');
  };

  return (
    <div className="login-container">
      <h1 className="login-title">
        INICIAR SESIÓN
      </h1>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-form-group">
          <label className="login-label">
            Nombre
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="login-input"
            placeholder="Tu nombre completo"
          />
        </div>

        <div className="login-form-group">
          <label className="login-label">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="login-input"
            placeholder="tu@email.com"
          />
        </div>

        <button
          type="submit"
          className="login-submit-button"
        >
          CONTINUAR
        </button>
      </form>

      <p className="login-help-text">
        ¿No tienes cuenta? Por ahora solo necesitas nombre y email.
      </p>
    </div>
  );
};

export default LoginPage;
