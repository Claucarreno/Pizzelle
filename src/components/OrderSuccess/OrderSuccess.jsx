import { CheckCircle, X } from "lucide-react";
import "./OrderSuccess.css";

function OrderSuccess({ order, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="success-modal">
        <button
          type="button"
          className="success-close"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="success-icon">
          <CheckCircle size={55} />
        </div>

        <span className="success-label">
          PEDIDO CONFIRMADO
        </span>

        <h2>¡Gracias por tu compra! 🍕</h2>

        <p>
          Tu pedido ha sido recibido correctamente.
        </p>

        <div className="order-details">
          <div>
            <span>Número de pedido</span>
            <strong>#{order.id}</strong>
          </div>

          <div>
            <span>Método de pago</span>
            <strong>{order.method}</strong>
          </div>

          <div>
            <span>Total</span>
            <strong>${order.total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="delivery-info">
          <strong>🛵 Tiempo estimado</strong>
          <span>30 - 45 minutos</span>
        </div>

        <button
          type="button"
          className="success-button"
          onClick={onClose}
        >
          Volver al menú
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;