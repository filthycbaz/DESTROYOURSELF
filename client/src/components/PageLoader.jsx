import React from "react";

// Fallback de Suspense para las rutas cargadas con React.lazy(). Mismo
// patrón visual que los estados de carga ya existentes en el sitio
// (HomePage: "Cargando productos...", ProductDetailPage: "Cargando
// producto...", OrdersPage: "Cargando pedidos...") — no introduce un
// spinner ni una librería nueva, solo el mismo texto centrado.
const PageLoader = () => (
  <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "monospace" }}>
    <p>Cargando...</p>
  </div>
);

export default PageLoader;
