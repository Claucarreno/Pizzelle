import { useCallback, useEffect, useRef, useState } from "react";
import { CartContext } from "./cart-context";
import { useAuth } from "./useAuth";
import { loadSavedCart, replaceSavedCart } from "../lib/cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const guestItems = useRef([]);
  const readyUserId = useRef(null);
  const saveQueue = useRef(Promise.resolve());
  const { user, configured } = useAuth();
  const userId = user?.id;

  const persistInOrder = useCallback((snapshot) => {
    saveQueue.current = saveQueue.current.catch(() => {}).then(() => replaceSavedCart(snapshot)).then(() => setCartError("")).catch((error) => setCartError(error.message || "No se pudo guardar el carrito."));
    return saveQueue.current;
  }, []);

  useEffect(() => {
    let active = true;
    readyUserId.current = null;
    if (!userId || !configured) {
      guestItems.current = [];
      const resetTimer = setTimeout(() => { setItems([]); setCartLoading(false); }, 0);
      return () => { active = false; clearTimeout(resetTimer); };
    }
    const loadTimer = setTimeout(() => {
      setCartLoading(true);
      setCartError("");
      loadSavedCart().then(async (savedItems) => {
        if (!active) return;
        const merged = [...savedItems];
        for (const guestItem of guestItems.current) {
          const found = merged.find((item) => item.id === guestItem.id);
          if (found) found.quantity = Math.min(20, found.quantity + guestItem.quantity);
          else merged.push(guestItem);
        }
        guestItems.current = [];
        await replaceSavedCart(merged);
        if (active) { readyUserId.current = userId; setItems(merged); }
      }).catch((error) => {
        if (active) setCartError(error.message || "No se pudo cargar el carrito guardado.");
      }).finally(() => { if (active) setCartLoading(false); });
    }, 0);
    return () => { active = false; clearTimeout(loadTimer); };
  }, [userId, configured]);

  useEffect(() => {
    if (!userId || readyUserId.current !== userId) return undefined;
    const timeout = setTimeout(() => {
      persistInOrder(items);
    }, 300);
    return () => clearTimeout(timeout);
  }, [items, userId, persistInOrder]);

  const updateItems = useCallback((updater) => {
    setItems((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      if (!userId || readyUserId.current !== userId) guestItems.current = next;
      return next;
    });
  }, [userId]);

  const addItem = useCallback((product) => {
    const existing = items.find((item) => item.id === product.id);
    if (existing?.quantity >= 20) return false;
    updateItems((current) => current.some((item) => item.id === product.id)
      ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { ...product, quantity: 1 }]);
    return true;
  }, [items, updateItems]);

  const increaseItem = useCallback((id) => {
    if ((items.find((item) => item.id === id)?.quantity || 0) >= 20) return false;
    updateItems((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
    return true;
  }, [items, updateItems]);

  const decreaseItem = useCallback((id) => {
    updateItems((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0));
  }, [updateItems]);

  const removeItem = useCallback((id) => updateItems((current) => current.filter((item) => item.id !== id)), [updateItems]);
  const clearCart = useCallback(() => updateItems([]), [updateItems]);
  const refreshPrices = useCallback((products) => {
    updateItems((current) => current.flatMap((item) => {
      const fresh = products.find((product) => product.id === item.id);
      return fresh ? [{ ...fresh, quantity: item.quantity }] : [];
    }));
  }, [updateItems]);

  return <CartContext.Provider value={{ cart: items, addItem, increaseItem, decreaseItem, removeItem, clearCart, refreshPrices, cartLoading, cartError }}>{children}</CartContext.Provider>;
}
