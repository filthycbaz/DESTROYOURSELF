import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const productId = product._id ?? product.id;

  const handleClick = () => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    navigate(`/product/${productId}`);
  };

  return (
    <div onClick={handleClick} className="product-card" data-testid={`product-card-${productId}`}>
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

        {/* Nota: este botón navega al detalle, no agrega al carrito directamente (ver docs/testing.md, defecto DEF-01) */}
        <button
          className="product-card-add-button"
          onClick={handleAddToCart}
          data-testid={`product-card-add-button-${productId}`}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
