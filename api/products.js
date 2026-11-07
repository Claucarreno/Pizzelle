import { getDatabase } from "../server/database.js";
import { allowMethods, sendError } from "../server/http.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  try {
    const products = await getDatabase()`SELECT id, name, description, price_cop, image_key FROM products WHERE active = TRUE ORDER BY id`;
    return res.status(200).json({ products });
  } catch (error) { return sendError(res, error); }
}
