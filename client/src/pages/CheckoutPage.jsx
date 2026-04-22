import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import "./CheckoutPage.css";
import { getAuthHeader } from "../services/authService";

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Tarjeta de crédito / débito",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    )
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.379 2.557.949 5.673-1.084 7.817-1.878 1.967-4.666 2.766-8.102 2.766H9.143l-1.136 7.184h4.608a.641.641 0 0 0 .633-.54l.026-.128.52-3.293.033-.18a.641.641 0 0 1 .633-.54h.399c2.58 0 4.598-.543 5.693-2.114.959-1.354 1.134-3.232.67-5.431z"/>
      </svg>
    )
  },
  {
    id: "oxxo",
    label: "OXXO Pay",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M2 10h20"/>
        <circle cx="7" cy="15" r="1" fill="currentColor"/>
        <line x1="11" y1="13" x2="11" y2="17"/>
        <line x1="15" y1="13" x2="15" y2="17"/>
      </svg>
    )
  },
  {
    id: "transfer",
    label: "Transferencia bancaria",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <line x1="12" y1="15" x2="12" y2="17"/>
      </svg>
    )
  }
];

const CARD_BRANDS = [
  { name: "Visa", prefix: ["4"] },
  { name: "Mastercard", prefix: ["51","52","53","54","55"] },
  { name: "Amex", prefix: ["34","37"] }
];

function detectCardBrand(number) {
  const clean = number.replace(/\s/g, "");
  for (const brand of CARD_BRANDS) {
    if (brand.prefix.some(p => clean.startsWith(p))) return brand.name;
  }
  return null;
}

function formatCardNumber(value) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: ""
  });

  const [paypalEmail, setPaypalEmail] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === "cardNumber") {
      setCardData({ ...cardData, cardNumber: formatCardNumber(value) });
    } else if (name === "expiry") {
      setCardData({ ...cardData, expiry: formatExpiry(value) });
    } else if (name === "cvv") {
      setCardData({ ...cardData, cvv: value.replace(/\D/g, "").slice(0, 4) });
    } else {
      setCardData({ ...cardData, [name]: value });
    }
  };

  const generateOrderId = () =>
    "ORD-" + Math.random().toString(16).substring(2, 8).toUpperCase();

  const buildPaymentInfo = () => {
    switch (paymentMethod) {
      case "card":
        return {
          method: "card",
          brand: detectCardBrand(cardData.cardNumber),
          last4: cardData.cardNumber.replace(/\s/g, "").slice(-4),
          cardHolder: cardData.cardHolder
        };
      case "paypal":
        return { method: "paypal", email: paypalEmail };
      case "oxxo":
        return { method: "oxxo", reference: "OXXO-" + Math.random().toString(36).substring(2, 10).toUpperCase() };
      case "transfer":
        return { method: "transfer" };
      default:
        return { method: paymentMethod };
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Armar el body que espera tu Order model
  const orderData = {
    items: cart.map((item) => ({
      product: item._id,           // antes era item.id (número), ahora es ObjectId de MongoDB
      name: item.name,
      image: item.image,
      price: item.price,
      size: item.size,
      quantity: item.quantity,
    })),
    shippingAddress: {
      street: form.address,
      city: "",                     // puedes agregar estos campos al form después
      state: "",
      zip: "",
    },
    payment: buildPaymentInfo(),    // esto no cambia
    total,
  };

  try {
    const res = await fetch("http://localhost:3001/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),         // JWT del usuario autenticado
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error al crear orden:", data.message);
      return;
    }

    // Guardar la orden real para ConfirmationPage
    localStorage.setItem("lastOrder", JSON.stringify(data));
    clearCart();
    navigate("/confirmation");

  } catch (error) {
    console.error("No se pudo conectar con el servidor:", error);
  }
};

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const cardBrand = detectCardBrand(cardData.cardNumber);

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Finalizar Compra</h1>

        <form onSubmit={handleSubmit} className="checkout-form">
          {/* — Datos personales — */}
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

            <label className="checkout-label">Dirección</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="checkout-input"
              required
            />
          </fieldset>

          {/* — Método de pago — */}
          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">Método de pago</legend>

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

            {/* Tarjeta */}
            {paymentMethod === "card" && (
              <div className="payment-fields card-fields">
                <div className="card-number-wrapper">
                  <label className="checkout-label">Número de tarjeta</label>
                  {cardBrand && <span className="card-brand-badge">{cardBrand}</span>}
                  <input
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    className="checkout-input"
                    placeholder="0000 0000 0000 0000"
                    required
                  />
                </div>

                <label className="checkout-label">Nombre en la tarjeta</label>
                <input
                  name="cardHolder"
                  value={cardData.cardHolder}
                  onChange={handleCardChange}
                  className="checkout-input"
                  placeholder="Como aparece en la tarjeta"
                  required
                />

                <div className="card-row">
                  <div className="card-field-half">
                    <label className="checkout-label">Vencimiento</label>
                    <input
                      name="expiry"
                      value={cardData.expiry}
                      onChange={handleCardChange}
                      className="checkout-input"
                      placeholder="MM/AA"
                      required
                    />
                  </div>
                  <div className="card-field-half">
                    <label className="checkout-label">CVV</label>
                    <input
                      name="cvv"
                      type="password"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      className="checkout-input"
                      placeholder="•••"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PayPal */}
            {paymentMethod === "paypal" && (
              <div className="payment-fields">
                <p className="payment-info-text">
                  Serás redirigido a PayPal para completar el pago de forma segura.
                </p>
                <label className="checkout-label">Email de PayPal</label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="checkout-input"
                  placeholder="tu@correo.com"
                  required
                />
              </div>
            )}

            {/* OXXO */}
            {paymentMethod === "oxxo" && (
              <div className="payment-fields">
                <div className="oxxo-info">
                  <span className="oxxo-info-icon">ℹ️</span>
                  <p className="payment-info-text">
                    Al confirmar, recibirás una referencia de pago por email. Tienes <strong>72 horas</strong> para pagar en cualquier tienda OXXO. Tu pedido se procesa una vez confirmado el pago.
                  </p>
                </div>
              </div>
            )}

            {/* Transferencia */}
            {paymentMethod === "transfer" && (
              <div className="payment-fields">
                <div className="transfer-info">
                  <p className="payment-info-text">
                    Al confirmar, recibirás los datos bancarios por email para realizar la transferencia. Tu pedido se procesa al recibir el depósito.
                  </p>
                  <div className="bank-detail">
                    <span className="bank-detail-label">Banco</span>
                    <span className="bank-detail-value">BBVA México</span>
                  </div>
                  <div className="bank-detail">
                    <span className="bank-detail-label">CLABE</span>
                    <span className="bank-detail-value">012 180 0123456789 01</span>
                  </div>
                  <div className="bank-detail">
                    <span className="bank-detail-label">Beneficiario</span>
                    <span className="bank-detail-value">Tu Tienda S.A. de C.V.</span>
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          <div className="checkout-total">
            Total a pagar: <strong>${total.toFixed(2)} MXN</strong>
          </div>

          <button type="submit" className="checkout-button">
            {paymentMethod === "oxxo" ? "Generar referencia OXXO" :
             paymentMethod === "paypal" ? "Continuar con PayPal" :
             "Confirmar Compra"}
          </button>
        </form>
      </div>
    </div>
  );
}