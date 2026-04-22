import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext"; 
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useApp(); 

  const productId = product._id ?? product.id;

  const handleClick = () => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    navigate(`/product/${productId}`);
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

        {/* 🔹 Botón para agregar al carrito */}
        <button
          className="product-card-add-button"
          onClick={handleAddToCart}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
