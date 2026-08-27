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
import ErrorFallback from "./components/ErrorFallback";
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
  <ErrorFallback
    title="NO PUDIMOS CARGAR EL CATÁLOGO"
    message="Ocurrió un error inesperado mostrando los productos."
    actionLabel="RECARGAR"
  />
);

const cartFallback = (
  <ErrorFallback
    title="NO PUDIMOS MOSTRAR TU CARRITO"
    message="Tus productos siguen guardados, no se perdieron. Intenta recargar la página."
    actionLabel="RECARGAR"
  />
);

const globalFallback = (
  <ErrorFallback
    title="ALGO SALIÓ MAL"
    message="Ocurrió un error inesperado. Intenta recargar la página."
    actionLabel="RECARGAR"
  />
);

const checkoutFallback = (
  <ErrorFallback
    title="ERROR AL PROCESAR EL CHECKOUT"
    message="No se realizó ningún cargo. Volvé a tu carrito e intenta de nuevo."
    actionLabel="VOLVER AL CARRITO"
    actionHref="/cart"
  />
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

