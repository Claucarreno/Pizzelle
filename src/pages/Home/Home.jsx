import { useState } from "react";

import Navbar from "../../components/Navbar/Navbar";
import ProductCard from "../../components/ProductCard/ProductCard";
import Cart from "../../components/Cart/Cart";
import Payment from "../../components/Payment/Payment";
import OrderSuccess from "../../components/OrderSuccess/OrderSuccess";

import image1 from "../../assets/pizzamargarita.png";
import image2 from "../../assets/pepperoni.png";
import image3 from "../../assets/hawaiana.png";
import image4 from "../../assets/tresquesos.png";
import image5 from "../../assets/vegetariana.png";
import image6 from "../../assets/chicken.png";

import "./Home.css";

function Home() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("pizzelleCart");

    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [lastOrder, setLastOrder] = useState(null);

  const [search, setSearch] = useState("");

  const products = [
    {
      id: 1,
      name: "Pizza Margherita",
      description: "Salsa de tomate, mozzarella y albahaca fresca.",
      price: 24000,
      image: image1,
    },
    {
      id: 2,
      name: "Pizza Pepperoni",
      description: "Salsa de tomate, mozzarella y pepperoni.",
      price: 25000,
      image: image2,
    },
    {
      id: 3,
      name: "Pizza Hawaiana",
      description: "Mozzarella, piña y jamón.",
      price: 15000,
      image: image3,
    },
    {
      id: 4,
      name: "Pizza Tres Quesos",
      description: "Mozzarella, parmesano y gorgonzola.",
      price: 18000,
      image: image4,
    },
    {
      id: 5,
      name: "Pizza Vegetariana",
      description: "Champiñones, cebolla y pimientos.",
      price: 20000,
      image: image5,
    },
    {
      id: 6,
      name: "Pizza Chicken",
      description: "Salsa BBQ, pollo y cebolla roja.",
      price: 17000,
      image: image6,
    },
  ];

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("pizzelleCart", JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);

    let newCart;

    if (existingProduct) {
      newCart = cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      );
    } else {
      newCart = [
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ];
    }

    saveCart(newCart);
  };

  const increaseQuantity = (id) => {
    const newCart = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item,
    );

    saveCart(newCart);
  };

  const decreaseQuantity = (id) => {
    const newCart = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item,
      )
      .filter((item) => item.quantity > 0);

    saveCart(newCart);
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter((item) => item.id !== id);

    saveCart(newCart);
  };

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

    setShowCart(false);
    setShowPayment(true);
  };

  const handlePayment = ({ method }) => {
    const order = {
      id: `PZ-${Date.now().toString().slice(-6)}`,
      method:
        method === "card"
          ? "Tarjeta"
          : method === "nequi"
            ? "Nequi"
            : "Efectivo",
      total: totalPrice,
      date: new Date().toLocaleString("es-CO"),
      products: cart,
    };

    localStorage.setItem("pizzelleLastOrder", JSON.stringify(order));

    setLastOrder(order);

    setCart([]);
    localStorage.removeItem("pizzelleCart");

    setShowPayment(false);
    setShowSuccess(true);
  };

  return (
    <div className="home">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setShowCart(true)}
        search={search}
        setSearch={setSearch}
      />

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

          {filteredProducts.length > 0 ? (
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
        />
      )}

      {showSuccess && lastOrder && (
        <OrderSuccess order={lastOrder} onClose={() => setShowSuccess(false)} />
      )}

      <footer className="home-footer" id="contacto">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>🍕 Pizzelle</h2>

            <p>
              Pizzas deliciosas preparadas con ingredientes frescos y mucho
              sabor.
            </p>
          </div>

          <div className="footer-column">
            <h3>Explorar</h3>

            <a href="#inicio">Inicio</a>
            <a href="#productos">Menú</a>
            <a href="#contacto">Contacto</a>
          </div>

          <div className="footer-column">
            <h3>Contacto</h3>

            <p>📞 +57 310 641 6986</p>
            <p>✉️ carrenoclaudia@gmail.com</p>
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
