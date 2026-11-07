import { clearSessionCookie } from "../../server/auth.js";
import { allowMethods } from "../../server/http.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
