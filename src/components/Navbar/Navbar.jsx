import { Link, useNavigate } from "react-router-dom";

import { ShoppingCart, LogOut, Search } from "lucide-react";

import "./Navbar.css";

import logo from "../../assets/logo.png";

function Navbar({ cartCount = 0, onCartClick, search = "", setSearch }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("pizzelleUser");
    localStorage.removeItem("piziaUser");

    navigate("/login");
  };

  return (
    <header className="navbar">
      {/* LOGO */}

      <div className="navbar-brand">
        <Link to="/" className="navbar-brand-link">
          <img src={logo} alt="Pizzelle" className="navbar-logo" />

          <div className="navbar-brand-text">
            <strong>Pizzelle</strong>

            <span>PIZZA & FOOD</span>
          </div>
        </Link>
      </div>

      {/* MENÚ */}

      <nav className="navbar-links">
        <Link to="/">Inicio</Link>

        <a href="/#productos">Menú</a>

        <a href="/#contacto">Contacto</a>
      </nav>

      {/* ACCIONES */}

      <div className="navbar-actions">
        {/* BUSCADOR */}

        <div className="navbar-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Buscar pizza..."
            value={search}
            onChange={(event) => setSearch?.(event.target.value)}
          />
        </div>

        {/* CARRITO */}

        <button type="button" className="cart-button" onClick={onCartClick}>
          <ShoppingCart size={18} />

          <span>Carrito</span>

          <b>{cartCount}</b>
        </button>

        {/* CERRAR SESIÓN */}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
