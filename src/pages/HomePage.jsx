import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import './HomePage.css';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'todos') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const categories = ['todos', 'playeras', 'pantalones', 'tenis', 'gorras', 'gafas', 'accesorios'];

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
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`home-filter-button ${selectedCategory === cat ? 'active' : ''}`}
        >
          {cat}
        </button>
      ))}
    </div>

    <div className="home-products-grid">
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>

  </div>
  );
};

export default HomePage;