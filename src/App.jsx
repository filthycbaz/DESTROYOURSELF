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
import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";

import "./styles/App.css";

/* =========================
   ROUTES
========================= */
function AnimatedRoutes() {
  return (
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
    <AuthProvider>
      <AppProvider>
        <Router>
          <Layout />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

