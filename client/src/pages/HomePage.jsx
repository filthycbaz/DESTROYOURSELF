import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const API_URL = 'http://localhost:3001/api';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/products?limit=100`),
          fetch(`${API_URL}/categories`),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        setProducts(productsData.products ?? []);
        setCategories(categoriesData.map((c) => c.slug));
      } catch (err) {
        setError('No se pudo conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const allCategories = ['todos', ...categories];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'todos') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, products]);

  return (
    <div className="home-container">

      <div className="home-hero">
        <div className="home-title-wrapper">
          <h1 className="home-title-first">DESTROY YOURSELF</h1>
          <h1 className="home-title-back">DESTROY YOURSELF</h1>
        </div>
        <p className="home-hero-description">
          Estas listo para destruirte?
          <br />Bazar enfocado en destruirte el estilo
        </p>
      </div>

      <div className="home-filters">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`home-filter-button ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', padding: '40px' }}>Cargando productos...</p>}
      {error && <p style={{ textAlign: 'center', padding: '40px', color: '#DC2626' }}>{error}</p>}

      {!loading && !error && (
        <div className="home-products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default HomePage;
