import { getDatabase } from "../server/database.js";
import { requireUser } from "../server/auth.js";
import { allowMethods, readBody, sendError, HttpError } from "../server/http.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PUT"])) return;
  try {
    const user = await requireUser(req);
    const sql = getDatabase();
    if (req.method === "GET") {
      const items = await sql`
        SELECT p.id, p.name, p.description, p.price_cop, p.image_key, c.quantity
        FROM cart_items c JOIN products p ON p.id = c.product_id
        WHERE c.user_id = ${user.id}::uuid AND p.active = TRUE
        ORDER BY p.id
      `;
      return res.status(200).json({ items });
    }
    const { items } = readBody(req);
    if (!Array.isArray(items) || items.length > 20 || items.some((item) => !item || typeof item !== "object" || !Number.isInteger(Number(item.id)) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 20)) {
      throw new HttpError(400, "El carrito no es válido.");
    }
    const lines = items.map((item) => ({ product_id: Number(item.id), quantity: Number(item.quantity) }));
    await sql`SELECT save_cart(${user.id}::uuid, ${JSON.stringify(lines)}::jsonb)`;
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error?.code === "P0001") error.status = 400;
    return sendError(res, error);
  }
}
