import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { getMyOrders } from "../../lib/orders";
import { useAuth } from "../../context/useAuth";
import { formatPrice } from "../../utils/formatPrice";
import "../Admin/Admin.css";

const statusNames = { pending: "Recibido", confirmed: "Confirmado", preparing: "En preparación", out_for_delivery: "En camino", delivered: "Entregado", cancelled: "Cancelado" };
function Orders() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { getMyOrders().then(setOrders).catch((e) => setError(e.message)); }, []);
  return <main className="orders-page"><header className="orders-top"><Link to="/" className="back-link"><ArrowLeft size={17} /> Volver al menú</Link><span>PIZZELLE · MI CUENTA</span><h1>Hola, {profile?.fullName?.split(" ")[0] || "bienvenido"}</h1><p>Consulta el estado y el detalle de tus pedidos.</p></header>
    {error && <p className="dashboard-error" role="alert">No pudimos cargar tus pedidos: {error}</p>}
    {!error && orders.length === 0 && <section className="dashboard-empty"><ClipboardList size={40} /><h2>Aún no tienes pedidos</h2><p>Cuando hagas tu primer pedido, aparecerá aquí.</p><Link to="/#productos" className="dashboard-button">Explorar el menú</Link></section>}
    <section className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><div className="order-card-head"><div><span className="order-number">{order.order_number}</span><p>{new Date(order.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</p></div><span className={`status-pill status-${order.status}`}>{statusNames[order.status] || order.status}</span></div><ul>{(order.order_items || []).map((item) => <li key={item.id}>{item.quantity} × {item.product_name}<strong>{formatPrice(item.line_total_cop)}</strong></li>)}</ul><div className="order-card-foot"><span>{order.payment_method === "nequi" ? "Nequi" : "Efectivo al recibir"}</span><strong>{formatPrice(order.total_cop)}</strong></div><p className="order-address">Entrega: {order.delivery_address}</p></article>)}</section>
  </main>;
}
export default Orders;
