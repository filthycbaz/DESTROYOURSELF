import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Header.css';

const Header = () => {
  const { cart, user, logout } = useApp();
  const navigate = useNavigate();

  const cartItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

return (
    <header className="header-container">

<video className="header-video" autoPlay loop muted playsInline>
  <source
    src="https://res.cloudinary.com/dus3ayd1j/video/upload/f_mp4,q_auto:good/IMG_3791_tgznmw.mp4"
    type="video/mp4"
  />
</video>

  
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

    {user ? (
      <button onClick={handleLogout} className="header-logout-button">
        SALIR
      </button>
    ) : (
      <Link to="/login" className="header-nav-link"><User size={20} /></Link>
    )}
  </nav>
</div>

  </header>
);
};

export default Header;