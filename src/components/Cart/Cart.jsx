import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

import "./Cart.css";

function Cart({
  cart,
  totalPrice,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onPayment,
}) {
  return (
    <div className="modal-overlay">
      <div className="cart-modal">
        {/* HEADER */}

        <div className="modal-header">
          <div>
            <span className="modal-label">TU PEDIDO</span>

            <h2>Mi carrito</h2>
          </div>

          <button type="button" className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* CARRITO VACÍO */}

        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={45} />

            <h3>Tu carrito está vacío</h3>

            <p>Agrega una deliciosa pizza para comenzar.</p>
          </div>
        ) : (
          <>
            {/* PRODUCTOS */}

            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>

                    <span>${item.price.toFixed(2)}</span>

                    <div className="quantity">
                      <button
                        type="button"
                        onClick={() => onDecrease(item.id)}
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={14} />
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        type="button"
                        onClick={() => onIncrease(item.id)}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="delete-item"
                    onClick={() => onRemove(item.id)}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>

            {/* TOTAL */}

            <div className="cart-total">
              <span>Total</span>

              <strong>${totalPrice.toFixed(2)}</strong>
            </div>

            {/* PAGO */}

            <button
              type="button"
              className="checkout-button"
              onClick={onPayment}
            >
              Proceder al pago
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
