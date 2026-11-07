import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/useAuth";
import logo from "../../assets/logo.png";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage("");
    if (!configured) { setMessage("La conexión con Supabase aún no está configurada. Revisa el archivo .env.local y el README."); return; }
    if (formData.password !== formData.confirmPassword) { setMessage("Las contraseñas no coinciden."); return; }
    if (formData.password.length < 8) { setMessage("Usa una contraseña de al menos 8 caracteres."); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password, options: { data: { full_name: formData.name.trim() } } });
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    if (data.session) navigate("/");
    else setMessage("Cuenta creada. Revisa tu correo para confirmar el registro y luego inicia sesión.");
  };

  return (
    <main className="auth-page"><div className="auth-card">
      <Link to="/" className="auth-logo"><img src={logo} alt="Logo Pizzelle" /><div className="auth-logo-text"><strong>Pizzelle</strong><span>PIZZA & FOOD</span></div></Link>
      <div className="auth-header"><span className="auth-label">ÚNETE A PIZZELLE</span><h1>Crear cuenta</h1><p>Regístrate para disfrutar de nuestras pizzas.</p></div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group"><label htmlFor="name">Nombre completo</label><input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tu nombre" autoComplete="name" required /></div>
        <div className="input-group"><label htmlFor="email">Correo electrónico</label><input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" autoComplete="email" required /></div>
        <div className="input-group"><label htmlFor="password">Contraseña</label><div className="password-wrapper"><input id="password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength="8" required /><button type="button" className="password-toggle" aria-label="Mostrar u ocultar contraseña" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>
        <div className="input-group"><label htmlFor="confirmPassword">Confirmar contraseña</label><div className="password-wrapper"><input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña" autoComplete="new-password" required /><button type="button" className="password-toggle" aria-label="Mostrar u ocultar confirmación" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>
        {message && <p role="status" className="auth-message">{message}</p>}
        <button type="submit" className="auth-button" disabled={busy}>{busy ? "Creando cuenta…" : "Crear cuenta"}</button>
      </form>
      <p className="auth-switch">¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </div></main>
  );
}
export default Register;
