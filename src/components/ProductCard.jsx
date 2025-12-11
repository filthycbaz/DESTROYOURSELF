import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext"; // 👈 importamos el contexto
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useApp(); // 👈 sacamos la función del contexto

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();        // 👈 evita que se dispare el navigate
    addToCart(product);         // 👈 agrega el producto al carrito
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
