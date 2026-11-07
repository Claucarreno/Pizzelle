import { useState } from "react";
import { X, Smartphone, Banknote } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import "./Payment.css";

function Payment({ totalPrice, onClose, onConfirm, busy = false, serverError = "" }) {
  const [method, setMethod] = useState("cash");
  const [formData, setFormData] = useState({ customerName: "", phone: "", address: "", notes: "" });
  const [error, setError] = useState("");
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.customerName.trim().length < 2 || formData.phone.trim().length < 7 || formData.address.trim().length < 8) {
      setError("Completa tu nombre, un teléfono válido y la dirección de entrega."); return;
    }
    onConfirm({ ...formData, paymentMethod: method });
  };
  return (
    <div className="modal-overlay"><section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="payment-header"><div><span>FINALIZAR PEDIDO</span><h2 id="checkout-title">Datos de entrega</h2></div><button type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div>
      <div className="payment-total"><span>Total del pedido</span><strong>{formatPrice(totalPrice)}</strong></div>
      <form onSubmit={handleSubmit}>
        <div className="payment-form">
          <label htmlFor="customerName">Nombre de quien recibe</label><input id="customerName" name="customerName" autoComplete="name" value={formData.customerName} onChange={handleChange} required maxLength="100" />
          <label htmlFor="phone">Teléfono</label><input id="phone" name="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={handleChange} required maxLength="30" placeholder="300 000 0000" />
          <label htmlFor="address">Dirección de entrega</label><input id="address" name="address" autoComplete="street-address" value={formData.address} onChange={handleChange} required maxLength="250" placeholder="Calle, número, barrio y ciudad" />
          <label htmlFor="notes">Indicaciones (opcional)</label><input id="notes" name="notes" value={formData.notes} onChange={handleChange} maxLength="300" placeholder="Apto, portería, referencias…" />
        </div>
        <div className="payment-form"><label>Método de pago</label><div className="payment-methods">
          <button type="button" className={method === "cash" ? "selected" : ""} onClick={() => setMethod("cash")}><Banknote size={20} /><span>Efectivo al recibir</span></button>
          <button type="button" className={method === "nequi" ? "selected" : ""} onClick={() => setMethod("nequi")}><Smartphone size={20} /><span>Nequi</span></button>
        </div>{method === "nequi" && <p className="payment-info">El pedido queda pendiente de pago. El negocio confirmará los datos de transferencia al contactarte.</p>}</div>
        {error && <p className="payment-error" role="alert">{error}</p>}
        {serverError && <p className="payment-error" role="alert">{serverError}</p>}
        <button type="submit" className="confirm-payment" disabled={busy}>{busy ? "Guardando pedido…" : "Confirmar pedido"}</button>
      </form>
    </section></div>
  );
}
export default Payment;
