import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <h2 className="footer-title">
            自分を破壊する
          </h2>
          <p className="footer-tagline">ruido visual controlado</p>
        </div>

        <div className="footer-links">
          <a href="/shop">Tienda</a>
          <a href="/about">Nosotros</a>
          <a href="/contact">Contacto</a>
          <a href="/privacy">Privacidad</a>
        </div>

      </div>

      <div className="footer-bottom">
        <span className="copy">© {new Date().getFullYear()} — todos los derechos reservados</span>
        <span>✦</span>
      </div>
    </footer>
  );
};

export default Footer;