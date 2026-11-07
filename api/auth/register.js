import bcrypt from "bcryptjs";
import { getDatabase } from "../../server/database.js";
import { setSessionCookie } from "../../server/auth.js";
import { allowMethods, readBody, sendError, HttpError } from "../../server/http.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  try {
    const { name, email, password } = readBody(req);
    const fullName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (fullName.length < 2 || fullName.length > 100) throw new HttpError(400, "Escribe tu nombre completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) throw new HttpError(400, "Escribe un correo válido.");
    if (typeof password !== "string" || password.length < 8 || password.length > 72) throw new HttpError(400, "La contraseña debe tener entre 8 y 72 caracteres.");
    const passwordHash = await bcrypt.hash(password, 12);
    const rows = await getDatabase()`
      INSERT INTO app_users (full_name, email, password_hash)
      VALUES (${fullName}, ${normalizedEmail}, ${passwordHash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, full_name, email, role
    `;
    if (!rows[0]) throw new HttpError(409, "Ya existe una cuenta con ese correo.");
    await setSessionCookie(res, rows[0].id);
    return res.status(201).json({ user: { id: rows[0].id, email: rows[0].email }, profile: { fullName: rows[0].full_name, role: rows[0].role } });
  } catch (error) { return sendError(res, error); }
}
