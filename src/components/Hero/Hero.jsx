import { ArrowDown, Sparkles } from "lucide-react";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-decoration hero-decoration-one"></div>
      <div className="hero-decoration hero-decoration-two"></div>

      <div className="hero-content">
        <span className="hero-badge">
          <Sparkles size={15} />
          SABOR + TECNOLOGÍA
        </span>

        <h1>
          Tu pizza favorita,
          <span> a un clic.</span>
        </h1>

        <p>
          Descubre sabores increíbles y disfruta una experiencia de compra
          rápida, sencilla y deliciosa.
        </p>

        <a href="#productos" className="hero-button">
          Explorar menú
          <ArrowDown size={18} />
        </a>
      </div>
    </section>
  );
}

export default Hero;
