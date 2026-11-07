import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Orders from "./pages/Orders/Orders";
import Admin from "./pages/Admin/Admin";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { useAuth } from "./context/useAuth";

function RequireUser({ children, admin = false }) {
  const { user, profile, loading, configured } = useAuth();
  if (loading) return <main className="page-state">Cargando tu cuenta…</main>;
  if (!configured) return <main className="page-state"><h1>La tienda aún no está disponible</h1><p>La API o la base PostgreSQL todavía no está conectada.</p><Link to="/">Volver al menú</Link></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && profile?.role !== "admin") return <main className="page-state"><h1>Acceso restringido</h1><p>Esta página es solo para administración.</p><Link to="/">Volver al menú</Link></main>;
  return children;
}

function App() {
  return <AuthProvider><CartProvider><BrowserRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/orders" element={<RequireUser><Orders /></RequireUser>} />
    <Route path="/admin" element={<RequireUser admin><Admin /></RequireUser>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></CartProvider></AuthProvider>;
}
export default App;
