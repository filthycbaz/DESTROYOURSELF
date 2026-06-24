import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuthHeader } from "../services/authService";
import { API_URL } from "../config/api";

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/me`, {
          headers: getAuthHeader(),
        });
        if (!res.ok) throw new Error("No se pudieron cargar los pedidos");
        const data = await res.json();
        setOrders(data);
      } catch {
        setError("No se pudo conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#DC2626" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h1 style={{ fontFamily: "monospace", marginBottom: "24px" }}>SIN PEDIDOS</h1>
        <p style={{ marginBottom: "32px" }}>Aún no has realizado ninguna compra.</p>
        <Link
          to="/"
          style={{
            background: "#000",
            color: "#fff",
            padding: "12px 32px",
            textDecoration: "none",
            fontFamily: "monospace",
            fontWeight: 700,
          }}
        >
          IR A LA TIENDA
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "80px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: "monospace", marginBottom: "40px" }}>MIS PEDIDOS</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "1px solid #e5e5e5",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#000")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")}
            >
              <div>
                <p style={{ fontFamily: "monospace", fontWeight: 700, marginBottom: "4px" }}>
                  # {order._id.slice(-8).toUpperCase()}
                </p>
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                  {new Date(order.createdAt).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p style={{ fontSize: "13px", color: "#666" }}>
                  {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 700, fontFamily: "monospace", marginBottom: "8px" }}>
                  ${order.total.toFixed(2)} MXN
                </p>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    background: order.status === "delivered" ? "#000" : "#f5f5f5",
                    color: order.status === "delivered" ? "#fff" : "#333",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
