import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";

import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";

// HomePage es la ruta de entrada ("/") — se queda eager (fuera de lazy()) a
// propósito: es lo primero que se pinta, así que separarla en su propio
// chunk solo agregaría un salto de red en el camino crítico sin beneficio.
import HomePage from "./pages/HomePage";

import "./styles/App.css";

// El resto de las páginas no se necesitan en el primer render — cada una
// pasa a ser su propio chunk, descargado solo cuando el usuario navega ahí.
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));

/* =========================
   ROUTES
========================= */
function AnimatedRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
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
    </Suspense>
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
    <AuthProvider>
      <AppProvider>
        <Router>
          <Layout />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

