import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import ProductCard from "../../components/ProductCard/ProductCard";
import Cart from "../../components/Cart/Cart";
import Payment from "../../components/Payment/Payment";
import OrderSuccess from "../../components/OrderSuccess/OrderSuccess";
import { useAuth } from "../../context/useAuth";
import { useCart } from "../../context/useCart";
import { createOrder } from "../../lib/orders";
import { getCatalog } from "../../lib/catalog";

import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { user, configured } = useAuth();
  const { cart, addItem, increaseItem, decreaseItem, removeItem, clearCart, refreshPrices, cartError } = useCart();

  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [lastOrder, setLastOrder] = useState(null);

  const [search, setSearch] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [products, setProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(configured);
  useEffect(() => {
    if (!configured) return;
    getCatalog().then((catalog) => {
      setProducts(catalog);
      refreshPrices(catalog);
    }).catch((error) => setNotice(`No pudimos cargar el menú desde la base de datos: ${error.message}`)).finally(() => setCatalogLoading(false));
  }, [configured, refreshPrices]);

  const addToCart = (product) => {
    setNotice("");
    if (!addItem(product)) setNotice("Puedes pedir hasta 20 unidades por producto.");
  };

  const increaseQuantity = (id) => {
    if (!increaseItem(id)) setNotice("Puedes pedir hasta 20 unidades por producto.");
  };

  const decreaseQuantity = (id) => decreaseItem(id);
  const removeFromCart = (id) => removeItem(id);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleGoToPayment = () => {
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    if (!configured) { setNotice("Configura primero Supabase para guardar y recibir pedidos."); setShowCart(false); return; }
    if (!user) { setShowCart(false); navigate("/login", { state: { from: "/" } }); return; }

    setShowCart(false);
    setShowPayment(true);
  };

  const handlePayment = async (details) => {
    setCheckoutBusy(true); setNotice("");
    try {
      const savedOrder = await createOrder({ ...details, items: cart });
      const order = { id: savedOrder.order_number, method: details.paymentMethod === "nequi" ? "Nequi" : "Efectivo al recibir", total: Number(savedOrder.total_cop) };
      setLastOrder(order); clearCart();
      setShowPayment(false); setShowSuccess(true);
    } catch (error) {
      setNotice(error.message || "No se pudo guardar el pedido. Inténtalo de nuevo.");
    } finally { setCheckoutBusy(false); }
  };

  return (
    <div className="home">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setShowCart(true)}
        search={search}
        setSearch={setSearch}
      />

      {!configured && <div className="setup-banner">La aplicación está en modo de configuración: conecta Supabase siguiendo el README para activar cuentas y pedidos.</div>}
      {notice && <div className="setup-banner error-banner" role="alert">{notice}</div>}
      {cartError && <div className="setup-banner error-banner" role="alert">No se pudo sincronizar tu carrito: {cartError}</div>}

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <span className="hero-tag">🍕 PIZZA ARTESANAL</span>

            <h1>
              Tu pizza favorita,
              <span> a tu manera.</span>
            </h1>

            <p>
              Ingredientes frescos, sabores increíbles y pizzas preparadas
              especialmente para ti.
            </p>

            <button
              type="button"
              className="hero-button"
              onClick={() =>
                document.getElementById("productos")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Ordenar ahora
            </button>
          </div>
        </section>

        <section className="products-section" id="productos">
          <div className="section-heading">
            <span>MENÚ</span>

            <h2>Nuestras pizzas</h2>

            <p>Elige tu favorita y agrégala al carrito.</p>
          </div>

          {catalogLoading ? <p className="catalog-loading">Cargando el menú…</p> : products.length === 0 ? (
            <div className="no-results"><span>🍕</span><h3>El menú no está disponible</h3><p>Vuelve a intentarlo más tarde.</p></div>
          ) : filteredProducts.length > 0 ? (
            <div className="product-list">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <span>🍕</span>

              <h3>No encontramos esa pizza</h3>

              <p>Intenta buscar otro nombre.</p>
            </div>
          )}
        </section>
      </main>

      {showCart && (
        <Cart
          cart={cart}
          totalPrice={totalPrice}
          onClose={() => setShowCart(false)}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onRemove={removeFromCart}
          onPayment={handleGoToPayment}
        />
      )}

      {showPayment && (
        <Payment
          totalPrice={totalPrice}
          onClose={() => setShowPayment(false)}
          onConfirm={handlePayment}
          busy={checkoutBusy}
          serverError={notice}
        />
      )}

      {showSuccess && lastOrder && (
        <OrderSuccess order={lastOrder} onClose={() => setShowSuccess(false)} />
      )}

      <footer className="home-footer" id="contacto">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>🍕 Pizzelle</h2>

            <p>Pizzas deliciosas preparadas con ingredientes frescos y mucho sabor.</p>
          </div>

          <div className="footer-column">
            <h3>Explorar</h3>

            <a href="#inicio">Inicio</a>
            <a href="#productos">Menú</a>
            <a href="#contacto">Contacto</a>
          </div>

          <div className="footer-column">
            <h3>Tu pedido</h3>
            <p>Atención al cliente</p>
            <p>El negocio confirmará la entrega y el pago al recibir tu pedido.</p>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Pizzelle. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default Home;
