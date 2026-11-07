import { getDatabase } from "../../server/database.js";
import { requireAdmin } from "../../server/auth.js";
import { allowMethods, readBody, sendError, HttpError } from "../../server/http.js";

const allowedStatuses = new Set(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]);

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;
  try {
    await requireAdmin(req);
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
        GROUP BY o.id ORDER BY o.created_at DESC
      `;
      return res.status(200).json({ orders });
    }
    const { id, status } = readBody(req);
    if (typeof id !== "string" || !allowedStatuses.has(status)) throw new HttpError(400, "El pedido o su estado no son válidos.");
    const updated = await sql`UPDATE orders SET status = ${status} WHERE id = ${id}::uuid RETURNING id`;
    if (!updated[0]) throw new HttpError(404, "No encontramos ese pedido.");
    return res.status(200).json({ ok: true });
  } catch (error) { return sendError(res, error); }
}
