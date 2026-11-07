import { supabase } from "./supabase";

export async function createOrder({ items, customerName, phone, address, notes, paymentMethod }) {
  if (!supabase) throw new Error("La base de datos aún no está configurada.");
  const { data, error } = await supabase.rpc("create_order", {
    p_items: items.map(({ id, quantity }) => ({ product_id: id, quantity })),
    p_customer_name: customerName,
    p_phone: phone,
    p_address: address,
    p_notes: notes || "",
    p_payment_method: paymentMethod,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function getMyOrders() {
  const { data, error } = await supabase.from("orders").select("*, order_items(*, products(name))").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllOrders() {
  const { data, error } = await supabase.from("orders").select("*, order_items(*, products(name))").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
