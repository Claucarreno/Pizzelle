import { supabase } from "./supabase";
import { productImages } from "../data/productImages";

export async function getCatalog() {
  if (!supabase) throw new Error("Configura la conexión con la base de datos para mostrar el menú.");
  const { data, error } = await supabase.from("products").select("id, name, description, price_cop").eq("active", true).order("id");
  if (error) throw error;
  return data.map((product) => ({ id: Number(product.id), name: product.name, description: product.description, price: product.price_cop, image: productImages[product.id] }));
}
