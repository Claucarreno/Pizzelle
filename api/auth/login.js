import bcrypt from "bcryptjs";
import { getDatabase } from "../../server/database.js";
import { setSessionCookie } from "../../server/auth.js";
import { allowMethods, readBody, sendError, HttpError } from "../../server/http.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  try {
    const { email, password } = readBody(req);
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedEmail || typeof password !== "string") throw new HttpError(400, "Escribe tu correo y contraseña.");
    const rows = await getDatabase()`SELECT id, full_name, email, role, password_hash FROM app_users WHERE email = ${normalizedEmail} LIMIT 1`;
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new HttpError(401, "Correo o contraseña incorrectos.");
    await setSessionCookie(res, user.id);
    return res.status(200).json({ user: { id: user.id, email: user.email }, profile: { fullName: user.full_name, role: user.role } });
  } catch (error) { return sendError(res, error); }
}
