import React from "react";
import { Link } from "react-router-dom";
import "./ConfirmationPage.css";

export default function ConfirmationPage() {
  const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));

  // Validación: si no hay order, no truenes
  if (!lastOrder) {
    return (
      <div className="confirmation-container">
        <h1 className="confirmation-title">No hay información de compra</h1>
        <Link to="/" className="confirmation-back-button">
          VOLVER A LA TIENDA
        </Link>
      </div>
    );
  }

  const { customer, items, orderId } = lastOrder;

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="confirmation-container">
      <div className="confirmation-box">
      <h1 className="confirmation-title">¡Compra exitosa!</h1>

      <p className="confirmation-text">
        Gracias por tu compra, <strong>{customer.name}</strong>.
      </p>

      {/* Número de orden */}
      <p className="confirmation-order">
        Número de orden: <strong>{orderId}</strong>
      </p>

      <h3>Resumen de tu orden:</h3>

      <ul className="confirmation-list">
        {items.map((item) => (
          <li key={`${item.id}-${item.size}`}>
            {item.name} (Talla {item.size}) x {item.quantity} — $
            {item.price * item.quantity} MXN
          </li>
        ))}
      </ul>

      <p className="confirmation-total">
        Total pagado: <strong>${total} MXN</strong>
      </p>

      {/* Botón regresar */}
      <Link to="/" className="confirmation-back-button">
        REGRESAR A LA TIENDA
      </Link>
      </div>
    </div>
  );
}

