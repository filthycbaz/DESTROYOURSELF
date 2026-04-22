import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './ProductDetailPage.css';

const API_URL = 'http://localhost:3001/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) {
          setError('Producto no encontrado');
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch {
        setError('No se pudo conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setMessage('Por favor selecciona una talla');
      return;
    }
    addToCart(product, selectedSize);
    setMessage('Producto agregado al carrito');
  };

  if (loading) {
    return (
      <div className="detail-container" style={{ textAlign: 'center', marginTop: '80px' }}>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="detail-container" style={{ textAlign: 'center', marginTop: '80px' }}>
        <h1 className="detail-title">PRODUCTO NO ENCONTRADO</h1>
        <button
          onClick={() => navigate('/')}
          className="detail-add-button"
          style={{ maxWidth: '300px', margin: '0 auto', background: '#000' }}
        >
          VOLVER A LA TIENDA
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <button onClick={() => navigate('/')} className="detail-back-button">
        ← VOLVER
      </button>

      <div className="detail-grid">
        <div className="detail-image-container">
          <img src={product.image} alt={product.name} className="detail-image" />
        </div>

        <div>
          <div className="detail-category">{product.category}</div>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-price">${product.price} MXN</div>
          <p className="detail-description">{product.description}</p>

          <div className="detail-size-section">
            <label className="detail-size-label">Talla</label>
            <div className="detail-size-buttons">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setMessage('');
                  }}
                  className={`detail-size-button ${selectedSize === size ? 'active' : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleAddToCart} className="detail-add-button">
            AGREGAR AL CARRITO
          </button>

          {message && (
            <p style={{ color: '#DC2626', fontWeight: '700', marginTop: '10px', textTransform: 'uppercase' }}>
              {message}
            </p>
          )}

          <div className="detail-details">
            <div className="detail-detail-row">
              <strong>Estado:</strong> {product.condition}
            </div>
            <div className="detail-detail-row">
              <strong>Marca:</strong> {product.brand}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
