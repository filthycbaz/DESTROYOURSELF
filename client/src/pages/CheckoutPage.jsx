import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getAuthHeader } from "../services/authService";
import { API_URL } from "../config/api";
import "./CheckoutPage.css";

const PAYMENT_METHODS = [
  {
    id: "tarjeta",
    label: "Tarjeta de crédito / débito",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: "transferencia",
    label: "Transferencia bancaria",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <line x1="12" y1="15" x2="12" y2="17" />
      </svg>
    ),
  },
  {
    id: "efectivo",
    label: "Pago en efectivo",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
];

export default function CheckoutPage() {
  const { cart, clearCart } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const orderData = {
      items: cart.map((item) => ({
        product: item._id ?? item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
      })),
      shippingAddress: {
        street: form.street,
        city: form.city,
        state: form.state,
        zip: form.zip,
      },
      paymentMethod,
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No se pudo crear la orden. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      await clearCart();
      navigate("/confirmation", {
        state: { order: data, customerName: form.name },
      });
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Finalizar Compra</h1>

        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Datos de contacto */}
          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">Datos de contacto</legend>

            <label className="checkout-label">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="checkout-input"
              required
            />

            <label className="checkout-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="checkout-input"
              required
            />
          </fieldset>

          {/* Dirección de envío */}
          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">Dirección de envío</legend>

            <label className="checkout-label">Calle y número</label>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              className="checkout-input"
              required
            />

            <label className="checkout-label">Ciudad</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="checkout-input"
              required
            />

            <div className="card-row">
              <div className="card-field-half">
                <label className="checkout-label">Estado</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="checkout-input"
                  required
                />
              </div>
              <div className="card-field-half">
                <label className="checkout-label">Código postal</label>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  className="checkout-input"
                  required
                />
              </div>
            </div>
          </fieldset>

          {/* Método de pago */}
          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">Método de pago preferido</legend>

            <div className="payment-methods">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`payment-method-option ${paymentMethod === method.id ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="payment-method-radio"
                  />
                  <span className="payment-method-icon">{method.icon}</span>
                  <span className="payment-method-label">{method.label}</span>
                </label>
              ))}
            </div>

            <p className="payment-info-text" style={{ marginTop: "12px" }}>
              Una vez confirmada tu orden, te contactaremos para coordinar el pago.
            </p>
          </fieldset>

          <div className="checkout-total">
            Total a pagar: <strong>${total.toFixed(2)} MXN</strong>
          </div>

          {error && (
            <p style={{ color: "#DC2626", fontWeight: 700, marginBottom: "12px" }}>
              {error}
            </p>
          )}

          <button type="submit" className="checkout-button" disabled={loading}>
            {loading ? "Procesando..." : "CONFIRMAR ORDEN"}
          </button>
        </form>
      </div>
    </div>
  );
}
