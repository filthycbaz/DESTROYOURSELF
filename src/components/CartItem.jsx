import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useApp();

  return (
    <div className="cart-item">
      <img 
        src={item.image}
        alt={item.name}
        className="cart-item-image"
      />

      <div className="cart-item-info">
        <h3 className="cart-item-name">{item.name}</h3>

        {item.size && (
          <div className="cart-item-size">Talla: {item.size}</div>
        )}

        <div className="cart-item-price">${item.price} MXN</div>
      </div>

      <div className="cart-item-actions">
        <button
          onClick={() => removeFromCart(item.id, item.size)}
          className="cart-item-remove-button"
        >
          <Trash2 size={20} />
        </button>

        <div className="cart-item-quantity-controls">
          <button
            onClick={() =>
              updateQuantity(item.id, item.size, item.quantity - 1)
            }
            className="cart-item-quantity-button"
          >
            <Minus size={16} />
          </button>

          <span className="cart-item-quantity">{item.quantity}</span>

          <button
            onClick={() =>
              updateQuantity(item.id, item.size, item.quantity + 1)
            }
            className="cart-item-quantity-button"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
