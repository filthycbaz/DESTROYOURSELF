import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./ConfirmationPage.css";

export default function ConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;
  const customerName = location.state?.customerName;

  if (!order) {
    return (
      <div className="confirmation-container">
        <h1 className="confirmation-title">No hay información de compra</h1>
        <p style={{ textAlign: "center", marginBottom: "24px" }}>
          Si realizaste una compra, puedes verla en tu historial de pedidos.
        </p>
        <Link to="/orders" className="confirmation-back-button">
          VER MIS PEDIDOS
        </Link>
      </div>
    );
  }

  const { _id, items, total } = order;

  return (
    <div className="confirmation-container" data-testid="order-success">
      <div className="confirmation-box">
        <h1 className="confirmation-title">¡Compra exitosa!</h1>

        {customerName && (
          <p className="confirmation-text">
            Gracias por tu compra, <strong>{customerName}</strong>.
          </p>
        )}

        <p className="confirmation-order">
          Número de orden: <strong data-testid="order-number">{_id}</strong>
        </p>

        <h3>Resumen de tu orden:</h3>

        <ul className="confirmation-list">
          {items.map((item) => (
            <li key={`${item._id ?? item.product}-${item.size}`}>
              {item.name} (Talla {item.size}) x {item.quantity} —{" "}
              ${(item.price * item.quantity).toFixed(2)} MXN
            </li>
          ))}
        </ul>

        <p className="confirmation-total">
          Total: <strong>${total?.toFixed(2)} MXN</strong>
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/orders" className="confirmation-back-button">
            VER MIS PEDIDOS
          </Link>
          <Link to="/" className="confirmation-back-button" style={{ background: "#555" }}>
            SEGUIR COMPRANDO
          </Link>
        </div>
      </div>
    </div>
  );
}
