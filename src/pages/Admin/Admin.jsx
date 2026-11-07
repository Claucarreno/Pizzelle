import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "../../lib/orders";
import { formatPrice } from "../../utils/formatPrice";
import "./Admin.css";

const statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
const statusNames = { pending: "Recibido", confirmed: "Confirmado", preparing: "En preparación", out_for_delivery: "En camino", delivered: "Entregado", cancelled: "Cancelado" };
function Admin() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const refresh = useCallback(() => getAllOrders().then(setOrders).catch((e) => setError(e.message)), []);
  useEffect(() => { refresh(); }, [refresh]);
  const changeStatus = async (id, status) => {
    setBusyId(id); setError("");
    try { await updateOrderStatus(id, status); await refresh(); }
    catch (e) { setError(e.message); }
    finally { setBusyId(null); }
  };
  return <main className="orders-page admin-page"><header className="orders-top"><Link to="/" className="back-link"><ArrowLeft size={17} /> Volver al menú</Link><span>PIZZELLE · ADMINISTRACIÓN</span><h1>Gestión de pedidos</h1><p>Revisa los pedidos recibidos y actualiza su estado.</p></header>
    <div className="admin-toolbar"><strong>{orders.length} pedido{orders.length === 1 ? "" : "s"}</strong><button type="button" className="refresh-button" onClick={refresh}><RefreshCw size={16} /> Actualizar</button></div>
    {error && <p className="dashboard-error" role="alert">No se pudo completar la operación: {error}</p>}
    {orders.length === 0 && !error && <section className="dashboard-empty"><h2>No hay pedidos todavía</h2><p>Los pedidos nuevos aparecerán aquí.</p></section>}
    <section className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><div className="order-card-head"><div><span className="order-number">{order.order_number}</span><p>{new Date(order.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</p></div><span className={`status-pill status-${order.status}`}>{statusNames[order.status] || order.status}</span></div><div className="admin-customer"><strong>{order.customer_name}</strong><a href={`tel:${order.phone}`}>{order.phone}</a><span>{order.delivery_address}</span>{order.delivery_notes && <small>Nota: {order.delivery_notes}</small>}</div><ul>{(order.order_items || []).map((item) => <li key={item.id}>{item.quantity} × {item.product_name}<strong>{formatPrice(item.line_total_cop)}</strong></li>)}</ul><div className="order-card-foot"><span>{order.payment_method === "nequi" ? "Nequi · pendiente de confirmar" : "Efectivo al recibir"}</span><strong>{formatPrice(order.total_cop)}</strong></div><label className="status-control">Estado del pedido<select value={order.status} disabled={busyId === order.id} onChange={(e) => changeStatus(order.id, e.target.value)}>{statuses.map((status) => <option key={status} value={status}>{statusNames[status]}</option>)}</select></label></article>)}</section>
  </main>;
}
export default Admin;
