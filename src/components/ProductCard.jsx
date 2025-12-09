import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div onClick={handleClick} className="product-card">
      <div className="product-card-image-container">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-card-image"
        />
      </div>
      <div className="product-card-content">
        <div className="product-card-category">
          {product.category}
        </div>
        <h3 className="product-card-title">
          {product.name}
        </h3>
        <div className="product-card-price">
          ${product.price} MXN
        </div>
      </div>
    </div>
  );
};

export default ProductCard;