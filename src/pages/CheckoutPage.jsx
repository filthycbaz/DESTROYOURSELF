import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, user, clearCart } = useApp();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    phone: ''
  });

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  useEffect(() => {
    if (!user) {
      setMessage('Debes iniciar sesión para continuar');
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  if (!user || cart.length === 0) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.address || !formData.city || !formData.phone) {
      setMessage('Por favor completa todos los campos');
      return;
    }

    const orderData = {
      user,
      items: cart,
      total,
      address: formData,
      orderDate: new Date().toISOString()
    };

    localStorage.setItem('dys_last_order', JSON.stringify(orderData));
    clearCart();
    navigate('/confirmation');
  };

  return (
    <div className="checkout-container">
      
      <h1 className="checkout-title">CHECKOUT</h1>

      {message && (
        <p style={{ color: '#DC2626', fontWeight: 700, marginBottom: '12px' }}>
          {message}
        </p>
      )}

      <div className="checkout-order-summary">
        <h2 className="checkout-summary-title">Tu Orden</h2>

        {cart.map(item => (
          <div key={`${item.id}-${item.size}`} className="checkout-order-item">
            <div>
              <div className="checkout-order-item-info">{item.name}</div>
              <div className="checkout-order-item-details">
                Talla: {item.size} × {item.quantity}
              </div>
            </div>
            <div className="checkout-order-item-price">
              ${item.price * item.quantity} MXN
            </div>
          </div>
        ))}

        <div className="checkout-order-total">
          <span>TOTAL</span>
          <span>${total} MXN</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <h2 className="checkout-form-title">Información de Envío</h2>

        <div className="checkout-form-group">
          <label className="checkout-label">Nombre</label>
          <input type="text" value={user.name} disabled className="checkout-input" />
        </div>

        <div className="checkout-form-group">
          <label className="checkout-label">Email</label>
          <input type="email" value={user.email} disabled className="checkout-input" />
        </div>

        <div className="checkout-form-group">
          <label className="checkout-label">Dirección</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="checkout-input"
            placeholder="Calle y número"
            required
          />
        </div>

        <div className="checkout-form-group">
          <label className="checkout-label">Ciudad</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="checkout-input"
            placeholder="Ciudad, Estado, CP"
            required
          />
        </div>

        <div className="checkout-form-group">
          <label className="checkout-label">Teléfono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="checkout-input"
            placeholder="(555) 123-4567"
            required
          />
        </div>

        <button type="submit" className="checkout-submit-button">
          CONFIRMAR COMPRA
        </button>

        <p className="checkout-disclaimer">
          Esta es una compra simulada. No se procesará ningún pago real.
        </p>
      </form>
    </div>
  );
};

export default CheckoutPage;
