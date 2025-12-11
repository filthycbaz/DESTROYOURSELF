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
      {/* 🎥 VIDEO SOLO EN HOME */}
      {isHome && (
        <video className="header-video" autoPlay loop muted playsInline>
          <source
            src="https://res.cloudinary.com/dus3ayd1j/video/upload/f_mp4,q_auto:good/IMG_3791_tgznmw.mp4"
            type="video/mp4"
          />
        </video>
      )}

      <div className="header-content">
        <h1 className="header-title">自分を破壊する</h1>

        <nav className="header-nav">
          <Link to="/" className="header-nav-link">TIENDA</Link>

          <Link to="/cart" className="header-nav-link">
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className="header-cart-badge">{cartItemsCount}</span>
            )}
          </Link>

          {auth ? (
            <button
              onClick={handleLogout}
              className="header-logout-button"
            >
              SALIR
            </button>
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
