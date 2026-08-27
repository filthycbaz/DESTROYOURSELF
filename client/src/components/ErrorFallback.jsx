import React from "react";

const actionStyle = {
  background: "#000",
  color: "#fff",
  padding: "12px 32px",
  border: "none",
  fontFamily: "monospace",
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};

// Layout compartido por los fallback de los ErrorBoundary de App.jsx — mismo
// título/mensaje/acción, cada sección solo cambia el texto y qué hace el
// botón. Sin actionHref, recarga la página (limpia cualquier estado roto);
// con actionHref, navega ahí (ej. checkout → volver al carrito).
const ErrorFallback = ({ title, message, actionLabel, actionHref }) => (
  <div style={{ textAlign: "center", padding: "80px 20px" }}>
    <h1 style={{ fontFamily: "monospace", marginBottom: "16px" }}>{title}</h1>
    <p style={{ marginBottom: "24px" }}>{message}</p>
    {actionHref ? (
      <a href={actionHref} style={actionStyle}>
        {actionLabel}
      </a>
    ) : (
      <button onClick={() => window.location.reload()} style={actionStyle}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default ErrorFallback;
