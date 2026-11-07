import { SignJWT, jwtVerify } from "jose";
import { getDatabase } from "./database.js";
import { HttpError } from "./http.js";

const cookieName = "pizzelle_session";
const maxAge = 60 * 60 * 24 * 7;

function secretBytes() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new HttpError(503, "La autenticación todavía no está configurada.");
  return new TextEncoder().encode(secret);
}

function getCookie(req, name) {
  const cookies = (req.headers.cookie || "").split(";");
  const match = cookies.map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : "";
}

export async function setSessionCookie(res, userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secretBytes());
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

export async function requireUser(req) {
  const token = getCookie(req, cookieName);
  if (!token) throw new HttpError(401, "Inicia sesión para continuar.");
  let userId;
  try {
    const { payload } = await jwtVerify(token, secretBytes());
    userId = payload.sub;
  } catch {
    throw new HttpError(401, "Tu sesión venció. Inicia sesión de nuevo.");
  }
  const sql = getDatabase();
  const rows = await sql`SELECT id, full_name, email, role FROM app_users WHERE id = ${userId}::uuid LIMIT 1`;
  if (!rows[0]) throw new HttpError(401, "La cuenta ya no está disponible.");
  return { id: rows[0].id, email: rows[0].email, fullName: rows[0].full_name, role: rows[0].role };
}

export async function requireAdmin(req) {
  const user = await requireUser(req);
  if (user.role !== "admin") throw new HttpError(403, "Esta acción es solo para administración.");
  return user;
}
