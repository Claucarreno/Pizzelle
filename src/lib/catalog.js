import { api } from "./api";
import { productImages } from "../data/productImages";

export async function getCatalog() {
  const { products } = await api("/api/products");
  return products.map((product) => ({
    id: Number(product.id), name: product.name, description: product.description,
    price: product.price_cop, image: productImages[product.image_key],
  }));
}
