import { ShoppingCart } from "lucide-react";

import "./ProductCard.css";
import { formatPrice } from "../../utils/formatPrice";
function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />

        <span className="product-badge">Pizzelle</span>
      </div>

      <div className="product-card-content">
        <h3>{product.name}</h3>

        <p>{product.description}</p>

        <div className="product-bottom">
          <span className="product-price">{formatPrice(product.price)}</span>

          <button
            type="button"
            className="add-button"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart size={17} />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
