import React, { useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";   
import "./Header.css";

const Header = () => {
  const { cart } = useApp();         
  const { auth, logout } = useAuth();  
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  const cartItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className={`header-container ${
        isHome ? "header-home" : "header-fixed"
      }`}
    >
     
      {isHome && (
        <video className="header-video" autoPlay loop muted playsInline>
          <source
            src="https://res.cloudinary.com/dus3ayd1j/video/upload/f_mp4,q_auto:good/IMG_3791_tgznmw.mp4"
            type="video/mp4"
          />
        </video>
      )}

      <div className="header-content">
        <img
          src="https://res.cloudinary.com/dus3ayd1j/image/upload/v1782429937/destroyurself_transparent_pgnvso.png"
          alt="DestroyYourself"
          className="header-title"
        />

        <nav className="header-nav">
          <Link to="/" className="header-nav-link">TIENDA</Link>

          <Link to="/cart" className="header-nav-link" data-testid="header-cart-link">
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className="header-cart-badge" data-testid="cart-count">{cartItemsCount}</span>
            )}
          </Link>

          {auth ? (
            <>
              <Link to="/orders" className="header-nav-link" style={{ fontSize: '12px' }}>
                MIS PEDIDOS
              </Link>
              <button
                onClick={handleLogout}
                className="header-logout-button"
              >
                SALIR
              </button>
            </>
          ) : (
            <Link to="/login" className="header-nav-link">
              <User size={20} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
