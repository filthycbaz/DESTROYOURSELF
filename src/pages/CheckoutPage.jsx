import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { cart, clearCart } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const generateOrderId = () =>
    "ORD-" + Math.random().toString(16).substring(2, 8).toUpperCase();

  const handleSubmit = (e) => {
    e.preventDefault();

    const order = {
      items: cart,
      customer: form,
      date: new Date().toISOString(),
      orderId: generateOrderId()
    };

    localStorage.setItem("lastOrder", JSON.stringify(order));
    clearCart();
    navigate("/confirmation");
  };

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Finalizar Compra</h1>

        <form onSubmit={handleSubmit} className="checkout-form">
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

          <label className="checkout-label">Dirección</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="checkout-input"
            required
          />

          <div className="checkout-total">
            Total a pagar: <strong>${total} MXN</strong>
          </div>

          <button type="submit" className="checkout-button">
            Confirmar Compra
          </button>
        </form>
      </div>
    </div>
  );
}
