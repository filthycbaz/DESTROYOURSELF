import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConfirmationPage.css';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem('dys_last_order');
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!orderData) {
    return null;
  }

  return (
    <div className={styles['confirmation-container']}>

      <div className={styles['confirmation-success-icon']}>
        ✓
      </div>

      <h1 className={styles['confirmation-title']}>
        ¡COMPRA CONFIRMADA!
      </h1>

      <p className={styles['confirmation-message']}>
        Gracias por tu compra, <strong>{orderData.user.name}</strong>.
        <br />
        Te enviaremos un correo de confirmación a <strong>{orderData.user.email}</strong>
      </p>

      <div className={styles['confirmation-box']}>
        <h3 className={styles['confirmation-box-title']}>
          Resumen de tu orden
        </h3>

        {orderData.items.map(item => (
          <div 
            key={`${item.id}-${item.size}`}
            className={styles['confirmation-order-item']}
          >
            <span>{item.name} (Talla {item.size}) × {item.quantity}</span>
            <span className={styles['confirmation-order-item-price']}>
              ${item.price * item.quantity} MXN
            </span>
          </div>
        ))}

        <div className={styles['confirmation-divider']}>
          <span>TOTAL</span>
          <span>${orderData.total} MXN</span>
        </div>
      </div>

      <div className={styles['confirmation-box']}>
        <h3 className={styles['confirmation-box-title']}>
          Información de Envío
        </h3>

        <div className={styles['confirmation-shipping-info']}>
          <p><strong>Dirección:</strong> {orderData.address.address}</p>
          <p><strong>Ciudad:</strong> {orderData.address.city}</p>
          <p><strong>Teléfono:</strong> {orderData.address.phone}</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className={styles['confirmation-continue-button']}
      >
        SEGUIR COMPRANDO
      </button>

      <p className={styles['confirmation-delivery-note']}>
        Recibirás tu pedido en 5-7 días hábiles.
      </p>

    </div>
  );
};

export default ConfirmationPage;
