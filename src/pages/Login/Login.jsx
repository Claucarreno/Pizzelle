import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { api } from "../../lib/api";
import logo from "../../assets/logo.png";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { configured, refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!configured) { setMessage("El servicio de PostgreSQL aún no está disponible. Inténtalo más tarde."); return; }
    setBusy(true); setMessage("");
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify(formData) });
      await refreshUser();
      navigate("/");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  return (
    <main className="auth-page"><div className="auth-card">
      <Link to="/" className="auth-logo"><img src={logo} alt="Logo Pizzelle" /><div className="auth-logo-text"><strong>Pizzelle</strong><span>PIZZA & FOOD</span></div></Link>
      <div className="auth-header"><span className="auth-label">BIENVENIDO</span><h1>Iniciar sesión</h1><p>Entra a tu cuenta y disfruta de tus pizzas favoritas.</p></div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group"><label htmlFor="email">Correo electrónico</label><input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" autoComplete="email" required /></div>
        <div className="input-group"><label htmlFor="password">Contraseña</label><div className="password-wrapper"><input id="password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" required /><button type="button" className="password-toggle" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>
        {message && <p role="alert" className="auth-message">{message}</p>}
        <button type="submit" className="auth-button" disabled={busy}>{busy ? "Ingresando…" : "Iniciar sesión"}</button>
      </form>
      <p className="auth-switch">¿No tienes una cuenta? <Link to="/register">Crear cuenta</Link></p>
    </div></main>
  );
}
export default Login;
