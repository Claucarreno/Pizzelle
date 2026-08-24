import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Por favor completa todos los campos.");
      return;
    }

    localStorage.setItem(
      "pizzelleUser",
      JSON.stringify({
        email: formData.email,
      }),
    );

    navigate("/");
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Logo Pizzelle" />

          <div className="auth-logo-text">
            <strong>Pizzelle</strong>
            <span>PIZZA & FOOD</span>
          </div>
        </Link>

        <div className="auth-header">
          <span className="auth-label">BIENVENIDO</span>

          <h1>Iniciar sesión</h1>

          <p>Entra a tu cuenta y disfruta de tus pizzas favoritas.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Correo electrónico</label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Iniciar sesión
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <p className="auth-switch">
          ¿No tienes una cuenta? <Link to="/register">Crear cuenta</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
