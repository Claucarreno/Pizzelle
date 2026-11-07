import { api } from "./api";

export function createOrder({ items, customerName, phone, address, notes, paymentMethod }) {
  return api("/api/orders", {
    method: "POST",
    body: JSON.stringify({ items, customerName, phone, address, notes, paymentMethod }),
  });
}

export async function getMyOrders() {
  const { orders } = await api("/api/orders");
  return orders;
}

export async function getAllOrders() {
  const { orders } = await api("/api/admin/orders");
  return orders;
}

export function updateOrderStatus(id, status) {
  return api("/api/admin/orders", { method: "PATCH", body: JSON.stringify({ id, status }) });
}
