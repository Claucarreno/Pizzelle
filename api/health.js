import { getDatabase } from "../server/database.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método no permitido." });
  }
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(200).json({ configured: false });
  }
  try {
    const rows = await getDatabase()`
      SELECT to_regclass('public.products') IS NOT NULL
        AND to_regclass('public.app_users') IS NOT NULL
        AND to_regclass('public.cart_items') IS NOT NULL
        AND to_regclass('public.orders') IS NOT NULL
        AND to_regclass('public.order_items') IS NOT NULL
        AND to_regprocedure('public.save_cart(uuid,jsonb)') IS NOT NULL
        AND to_regprocedure('public.create_order(uuid,jsonb,text,text,text,text,text)') IS NOT NULL AS schema_ready
    `;
    if (!rows[0]?.schema_ready) return res.status(503).json({ configured: false });
    return res.status(200).json({ configured: true });
  } catch {
    return res.status(503).json({ configured: false });
  }
}
