import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-left">
          <h2 className="logo">自分を破壊する</h2>
          <p className="copy">© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>

        <div className="footer-links">
          <a href="/shop">Tienda</a>
          <a href="/about">Nosotros</a>
          <a href="/contact">Contacto</a>
          <a href="/privacy">Privacidad</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
