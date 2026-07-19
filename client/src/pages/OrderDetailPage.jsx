import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAuthHeader } from "../services/authService";
import { API_URL } from "../config/api";

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${id}`, {
          headers: getAuthHeader(),
        });
        if (res.status === 403) {
          navigate("/orders");
          return;
        }
        if (!res.ok) throw new Error("Orden no encontrada");
        const data = await res.json();
        setOrder(data);
      } catch {
        setError("No se pudo cargar el pedido");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p>Cargando pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#DC2626" }}>
        <p>{error || "Pedido no encontrado"}</p>
        <Link to="/orders" style={{ color: "#000" }}>
          ← Volver a mis pedidos
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "80px auto", padding: "0 20px" }}>
      <button
        onClick={() => navigate("/orders")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "monospace",
          marginBottom: "32px",
          padding: 0,
        }}
      >
        ← VOLVER A MIS PEDIDOS
      </button>

      <h1 style={{ fontFamily: "monospace", marginBottom: "8px" }}>PEDIDO</h1>
      <p style={{ fontFamily: "monospace", color: "#666", marginBottom: "32px" }}>
        # {order._id.slice(-8).toUpperCase()}
      </p>

      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", marginBottom: "32px" }}>
        <div>
          <p style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>FECHA</p>
          <p style={{ fontFamily: "monospace" }}>
            {new Date(order.createdAt).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>ESTADO</p>
          <span
            style={{
              padding: "4px 10px",
              background: order.status === "delivered" ? "#000" : "#f5f5f5",
              color: order.status === "delivered" ? "#fff" : "#333",
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <div>
          <p style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>PAGO</p>
          <p style={{ fontFamily: "monospace", textTransform: "capitalize" }}>
            {order.paymentMethod}
          </p>
        </div>
      </div>

      <h2 style={{ fontFamily: "monospace", marginBottom: "16px", fontSize: "14px" }}>
        PRODUCTOS
      </h2>
      <div style={{ borderTop: "1px solid #e5e5e5", marginBottom: "24px" }}>
        {order.items.map((item) => (
          <div
            key={`${item._id}-${item.size}`}
            style={{
              display: "flex",
              gap: "16px",
              padding: "16px 0",
              borderBottom: "1px solid #e5e5e5",
              alignItems: "center",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ width: "64px", height: "64px", objectFit: "cover", flexShrink: 0 }}
              loading="lazy"
              decoding="async"
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "monospace", fontWeight: 700, marginBottom: "4px" }}>
                {item.name}
              </p>
              <p style={{ fontSize: "13px", color: "#666" }}>
                Talla: {item.size} · Cantidad: {item.quantity}
              </p>
            </div>
            <p style={{ fontFamily: "monospace", fontWeight: 700, whiteSpace: "nowrap" }}>
              ${(item.price * item.quantity).toFixed(2)} MXN
            </p>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "monospace", marginBottom: "16px", fontSize: "14px" }}>
        ENVÍO
      </h2>
      <p style={{ fontFamily: "monospace", lineHeight: 1.8, marginBottom: "32px", color: "#444" }}>
        {order.shippingAddress.street}<br />
        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
        {order.shippingAddress.zip}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "2px solid #000",
          paddingTop: "16px",
        }}
      >
        <span style={{ fontFamily: "monospace", fontWeight: 700 }}>TOTAL</span>
        <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
          ${order.total.toFixed(2)} MXN
        </span>
      </div>
    </div>
  );
}
