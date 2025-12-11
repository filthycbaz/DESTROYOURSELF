import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';   // <-- Importante

import PrivateRoute from './components/PrivateRoute';   // <-- Ruta protegida

import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';

import './styles/App.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="page-transition">
      <Routes location={location} key={location.pathname}>

        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 🔥 RUTA PROTEGIDA */}
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
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>      {/* ⬅ Aquí envolvemos TODO */}
      <AppProvider>
        <Router>
          <Header />
          <AnimatedRoutes />
          <Footer />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

