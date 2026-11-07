import { api } from "./api";
import { productImages } from "../data/productImages";

export async function loadSavedCart() {
  const { items } = await api("/api/cart");
  return items.map((item) => ({
    id: Number(item.id), name: item.name, description: item.description,
    price: item.price_cop, image: productImages[item.image_key], quantity: item.quantity,
  }));
}

export async function replaceSavedCart(items) {
  return api("/api/cart", {
    method: "PUT",
    body: JSON.stringify({ items: items.map(({ id, quantity }) => ({ id, quantity })) }),
  });
}
