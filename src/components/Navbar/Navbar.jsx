import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, Search, ClipboardList, UserRound } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import "./Navbar.css";
import logo from "../../assets/logo.png";

function Navbar({ cartCount = 0, onCartClick, search = "", setSearch }) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const handleLogout = async () => { await signOut(); navigate("/"); };
  return (
    <header className="navbar">
      <div className="navbar-brand"><Link to="/" className="navbar-brand-link"><img src={logo} alt="Pizzelle" className="navbar-logo" /><div className="navbar-brand-text"><strong>Pizzelle</strong><span>PIZZA & FOOD</span></div></Link></div>
      <nav className="navbar-links"><Link to="/">Inicio</Link><a href="/#productos">Menú</a><a href="/#contacto">Contacto</a></nav>
      <div className="navbar-actions">
        <div className="navbar-search"><Search size={17} /><input type="search" aria-label="Buscar en el menú" placeholder="Buscar pizza..." value={search} onChange={(event) => setSearch?.(event.target.value)} /></div>
        {user && <Link className="nav-account-link" to="/orders" title="Mis pedidos"><ClipboardList size={17} /><span>Pedidos</span></Link>}
        {profile?.role === "admin" && <Link className="nav-account-link" to="/admin" title="Administración"><UserRound size={17} /><span>Admin</span></Link>}
        <button type="button" className="cart-button" onClick={onCartClick}><ShoppingCart size={18} /><span>Carrito</span><b>{cartCount}</b></button>
        {user ? <button type="button" className="logout-button" onClick={handleLogout} title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut size={18} /></button> : <Link className="nav-login-link" to="/login">Ingresar</Link>}
      </div>
    </header>
  );
}
export default Navbar;
