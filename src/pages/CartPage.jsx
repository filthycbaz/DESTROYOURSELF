import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";   
import CartItem from "../components/CartItem";
import "./CartPage.css";

const CartPage = () => {
  const { cart } = useApp();
  const { auth, user } = useAuth(); 
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cart]);

  const handleCheckout = () => {
    if (!auth) { 
      setMessage("Debes iniciar sesión para continuar");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty-container">
        <h1 className="cart-empty-title">TU CARRITO ESTÁ VACÍO</h1>
        <p className="cart-empty-text">
          Explora nuestro catálogo y encuentra piezas únicas.
        </p>
        <button onClick={() => navigate("/")} className="cart-shop-button">
          IR A LA TIENDA
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">CARRITO</h1>

      <div className="cart-grid">
        <div>
          {cart.map((item) => (
            <CartItem key={`${item.id}-${item.size}`} item={item} />
          ))}
        </div>

        <div>
          <div className="cart-summary">
            <h2 className="cart-summary-title">RESUMEN</h2>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${subtotal} MXN</span>
            </div>

            <div className="cart-summary-total">
              <span>TOTAL</span>
              <span>${subtotal} MXN</span>
            </div>

            <button onClick={handleCheckout} className="cart-checkout-button">
              PROCEDER AL PAGO
            </button>

            {message && (
              <p
                style={{
                  color: "#DC2626",
                  fontWeight: 700,
                  marginTop: "10px",
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
