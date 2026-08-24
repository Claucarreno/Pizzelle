import { useState } from "react";
import { X, CreditCard, Smartphone, Banknote } from "lucide-react";
import "./Payment.css";

function Payment({ totalPrice, onClose, onConfirm }) {
  const [method, setMethod] = useState("card");

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    nequi: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setError("");
  };

  const validatePayment = () => {
    if (method === "card") {
      if (
        !formData.cardNumber ||
        !formData.cardName ||
        !formData.expiry ||
        !formData.cvv
      ) {
        setError("Completa todos los datos de la tarjeta.");
        return false;
      }

      if (formData.cardNumber.replace(/\s/g, "").length < 16) {
        setError("El número de tarjeta debe tener 16 dígitos.");
        return false;
      }

      if (formData.cvv.length < 3) {
        setError("El CVV debe tener al menos 3 dígitos.");
        return false;
      }
    }

    if (method === "nequi" && !formData.nequi) {
      setError("Ingresa tu número de Nequi.");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validatePayment()) return;

    onConfirm({
      method,
      ...formData,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <div>
            <span>FINALIZAR PEDIDO</span>
            <h2>Método de pago</h2>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="payment-total">
          <span>Total a pagar</span>
          <strong>${totalPrice.toFixed(2)}</strong>
        </div>

        <div className="payment-methods">
          <button
            type="button"
            className={method === "card" ? "selected" : ""}
            onClick={() => {
              setMethod("card");
              setError("");
            }}
          >
            <CreditCard size={20} />
            <span>Tarjeta</span>
          </button>

          <button
            type="button"
            className={method === "nequi" ? "selected" : ""}
            onClick={() => {
              setMethod("nequi");
              setError("");
            }}
          >
            <Smartphone size={20} />
            <span>Nequi</span>
          </button>

          <button
            type="button"
            className={method === "cash" ? "selected" : ""}
            onClick={() => {
              setMethod("cash");
              setError("");
            }}
          >
            <Banknote size={20} />
            <span>Efectivo</span>
          </button>
        </div>

        <div className="payment-form">
          {method === "card" && (
            <>
              <label>Número de tarjeta</label>

              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />

              <label>Titular de la tarjeta</label>

              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                placeholder="Nombre completo"
              />

              <div className="form-row">
                <div>
                  <label>Vencimiento</label>

                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleChange}
                    placeholder="MM/AA"
                    maxLength="5"
                  />
                </div>

                <div>
                  <label>CVV</label>

                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength="4"
                  />
                </div>
              </div>
            </>
          )}

          {method === "nequi" && (
            <>
              <label>Número Nequi</label>

              <input
                type="tel"
                name="nequi"
                value={formData.nequi}
                onChange={handleChange}
                placeholder="300 000 0000"
                maxLength="10"
              />

              <p className="payment-info">
                Esta es una demostración de pago. No se realizará ninguna
                transacción real.
              </p>
            </>
          )}

          {method === "cash" && (
            <div className="cash-info">
              <Banknote size={35} />

              <h3>Pago contra entrega</h3>

              <p>Puedes pagar tu pedido en efectivo cuando recibas tu pizza.</p>
            </div>
          )}

          {error && <p className="payment-error">{error}</p>}
        </div>

        <button
          type="button"
          className="confirm-payment"
          onClick={handleSubmit}
        >
          Confirmar pedido
        </button>
      </div>
    </div>
  );
}

export default Payment;
