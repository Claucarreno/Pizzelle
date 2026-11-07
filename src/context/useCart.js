import { useContext } from "react";
import { CartContext } from "./cart-context";

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart debe usarse dentro de CartProvider");
  return value;
}
