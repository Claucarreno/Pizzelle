import { getDatabase } from "../server/database.js";
import { requireUser } from "../server/auth.js";
import { allowMethods, readBody, sendError, HttpError } from "../server/http.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  try {
    const user = await requireUser(req);
    const sql = getDatabase();
    if (req.method === "GET") {
      const orders = await sql`
        SELECT o.id, o.order_number, o.customer_name, o.phone, o.delivery_address, o.delivery_notes,
          o.payment_method, o.status, o.total_cop, o.created_at,
          COALESCE(json_agg(json_build_object(
            'id', i.id, 'product_name', i.product_name, 'quantity', i.quantity,
            'line_total_cop', i.line_total_cop
          )) FILTER (WHERE i.id IS NOT NULL), '[]'::json) AS order_items
        FROM orders o LEFT JOIN order_items i ON i.order_id = o.id
        WHERE o.user_id = ${user.id}::uuid
        GROUP BY o.id ORDER BY o.created_at DESC
      `;
      return res.status(200).json({ orders });
    }
    const body = readBody(req);
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const paymentMethod = body.paymentMethod;
    if (customerName.length < 2 || customerName.length > 100) throw new HttpError(400, "Escribe el nombre de quien recibe.");
    if (phone.length < 7 || phone.length > 30) throw new HttpError(400, "Escribe un teléfono válido.");
    if (address.length < 8 || address.length > 250) throw new HttpError(400, "Escribe una dirección completa.");
    if (notes.length > 300) throw new HttpError(400, "Las indicaciones son demasiado largas.");
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20 || body.items.some((item) => !item || typeof item !== "object")) throw new HttpError(400, "El carrito está vacío o no es válido.");
    const items = body.items.map((item) => ({ product_id: Number(item.id), quantity: Number(item.quantity) }));
    if (items.some((item) => !Number.isInteger(item.product_id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20)) throw new HttpError(400, "La cantidad de productos no es válida.");
    if (!["cash", "nequi"].includes(paymentMethod)) throw new HttpError(400, "El método de pago no es válido.");
    const created = await sql`
      SELECT * FROM create_order(
        ${user.id}::uuid, ${JSON.stringify(items)}::jsonb, ${customerName},
        ${phone}, ${address}, ${notes}, ${paymentMethod}
      )
    `;
    if (!created[0]) throw new Error("El pedido no pudo guardarse.");
    return res.status(201).json(created[0]);
  } catch (error) {
    if (error?.code === "P0001") error.status = 400;
    return sendError(res, error);
  }
}
