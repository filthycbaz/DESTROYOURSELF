import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";

import PrivateRoute from "./components/PrivateRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";

import "./styles/App.css";

/* =========================
   FALLBACKS DE ERROR (por sección)
========================= */
const catalogFallback = (
  <div style={{ textAlign: "center", padding: "80px 20px" }}>
    <h1 style={{ fontFamily: "monospace", marginBottom: "16px" }}>NO PUDIMOS CARGAR EL CATÁLOGO</h1>
    <p style={{ marginBottom: "24px" }}>Ocurrió un error inesperado mostrando los productos.</p>
    <button
      onClick={() => window.location.reload()}
      style={{ background: "#000", color: "#fff", padding: "12px 32px", border: "none", fontFamily: "monospace", fontWeight: 700, cursor: "pointer" }}
    >
      RECARGAR
    </button>
  </div>
);

const cartFallback = (
  <div style={{ textAlign: "center", padding: "80px 20px" }}>
    <h1 style={{ fontFamily: "monospace", marginBottom: "16px" }}>NO PUDIMOS MOSTRAR TU CARRITO</h1>
    <p style={{ marginBottom: "24px" }}>Tus productos siguen guardados, no se perdieron. Intenta recargar la página.</p>
    <button
      onClick={() => window.location.reload()}
      style={{ background: "#000", color: "#fff", padding: "12px 32px", border: "none", fontFamily: "monospace", fontWeight: 700, cursor: "pointer" }}
    >
      RECARGAR
    </button>
  </div>
);

const globalFallback = (
  <div style={{ textAlign: "center", padding: "80px 20px" }}>
    <h1 style={{ fontFamily: "monospace", marginBottom: "16px" }}>ALGO SALIÓ MAL</h1>
    <p style={{ marginBottom: "24px" }}>Ocurrió un error inesperado. Intenta recargar la página.</p>
    <button
      onClick={() => window.location.reload()}
      style={{ background: "#000", color: "#fff", padding: "12px 32px", border: "none", fontFamily: "monospace", fontWeight: 700, cursor: "pointer" }}
    >
      RECARGAR
    </button>
  </div>
);

const checkoutFallback = (
  <div style={{ textAlign: "center", padding: "80px 20px" }}>
    <h1 style={{ fontFamily: "monospace", marginBottom: "16px" }}>ERROR AL PROCESAR EL CHECKOUT</h1>
    <p style={{ marginBottom: "24px" }}>No se realizó ningún cargo. Volvé a tu carrito e intenta de nuevo.</p>
    <a
      href="/cart"
      style={{ background: "#000", color: "#fff", padding: "12px 32px", textDecoration: "none", fontFamily: "monospace", fontWeight: 700 }}
    >
      VOLVER AL CARRITO
    </a>
  </div>
);

/* =========================
   ROUTES
========================= */
function AnimatedRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ErrorBoundary section="catalogo" fallback={catalogFallback}>
            <HomePage />
          </ErrorBoundary>
        }
      />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route
        path="/cart"
        element={
          <ErrorBoundary section="carrito" fallback={cartFallback}>
            <CartPage />
          </ErrorBoundary>
        }
      />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <ErrorBoundary section="checkout" fallback={checkoutFallback}>
              <CheckoutPage />
            </ErrorBoundary>
          </PrivateRoute>
        }
      />

      <Route path="/confirmation" element={<ConfirmationPage />} />

      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <PrivateRoute>
            <OrderDetailPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

/* =========================
   LAYOUT
========================= */
function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <Header />
      <main className={!isHome ? "with-fixed-header" : ""}>
        <AnimatedRoutes />
      </main>
      <Footer />
    </>
  );
}

/* =========================
   APP
========================= */
export default function App() {
  return (
    <ErrorBoundary section="global" fallback={globalFallback}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <Layout />
          </Router>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

