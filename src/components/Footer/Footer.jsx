import "./Footer.css";

function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="footer-main">
        {/* MARCA */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">N</div>

            <div>
              <strong>PizIA</strong>
              <span>FOOD & IA</span>
            </div>
          </div>

          <p>
            Pizzas deliciosas, pedidos sencillos y una experiencia inteligente
            gracias a PizIA.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Instagram">
              ◎
            </a>

            <a href="#" aria-label="Facebook">
              f
            </a>

            <a href="#" aria-label="X">
              X
            </a>
          </div>
        </div>

        {/* EXPLORA */}
        <div className="footer-column">
          <h3>Explora</h3>

          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#contacto">Contacto</a>
        </div>

        {/* INFORMACIÓN */}
        <div className="footer-column">
          <h3>Información</h3>

          <a href="#productos">Nuestras pizzas</a>
          <a href="#contacto">Preguntas frecuentes</a>
          <a href="#contacto">Términos y condiciones</a>
        </div>

        {/* CONTACTO */}
        <div className="footer-column footer-contact">
          <h3>Contáctanos</h3>

          <p>
            <span className="contact-icon">☎</span>
            +57 310 641 6986
          </p>

          <p>
            <span className="contact-icon">✉</span>
            carrenoclaudia981@gmail.com
          </p>

          <p>
            <span className="contact-icon">⌖</span>
            Bogotá, Colombia
          </p>

          <p>
            <span className="contact-icon">◷</span>
            Lun - Vie · 11:00 AM - 10:00 PM
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 PizIA. Todos los derechos reservados.</span>

        <span>Hecho con ❤️ para una mejor experiencia.</span>
      </div>
    </footer>
  );
}

export default Footer;
