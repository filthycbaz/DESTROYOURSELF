import React from "react";
import { Link } from "react-router-dom";
import "./ConfirmationPage.css";

export default function ConfirmationPage() {
  const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));

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

  const { _id, customerName, items, total } = lastOrder;

  return (
    <div className="confirmation-container">
      <div className="confirmation-box">
        <h1 className="confirmation-title">¡Compra exitosa!</h1>

        {customerName && (
          <p className="confirmation-text">
            Gracias por tu compra, <strong>{customerName}</strong>.
          </p>
        )}

        <p className="confirmation-order">
          Número de orden: <strong>{_id}</strong>
        </p>

        <h3>Resumen de tu orden:</h3>

        <ul className="confirmation-list">
          {items.map((item) => (
            <li key={`${item._id ?? item.product}-${item.size}`}>
              {item.name} (Talla {item.size}) x {item.quantity} — $
              {item.price * item.quantity} MXN
            </li>
          ))}
        </ul>

        <p className="confirmation-total">
          Total pagado: <strong>${total?.toFixed(2)} MXN</strong>
        </p>

        <Link to="/" className="confirmation-back-button">
          REGRESAR A LA TIENDA
        </Link>
      </div>
    </div>
  );
}
