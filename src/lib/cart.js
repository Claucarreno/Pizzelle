import { supabase } from "./supabase";
import { productImages } from "../data/productImages";

export async function loadSavedCart() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("cart_items")
    .select("product_id, quantity, products(id, name, description, price_cop)")
    .order("product_id");
  if (error) throw error;
  return (data || []).flatMap((row) => row.products ? [{
    id: Number(row.product_id),
    name: row.products.name,
    description: row.products.description,
    price: row.products.price_cop,
    image: productImages[row.product_id],
    quantity: row.quantity,
  }] : []);
}

export async function replaceSavedCart(items) {
  if (!supabase) throw new Error("La conexión con la base de datos no está configurada.");
  const { error } = await supabase.rpc("save_cart", {
    p_items: items.map(({ id, quantity }) => ({ product_id: id, quantity })),
  });
  if (error) throw error;
}
