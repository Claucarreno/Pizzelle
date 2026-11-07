export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function allowMethods(req, res, methods) {
  res.setHeader("Allow", methods.join(", "));
  if (!methods.includes(req.method)) {
    res.status(405).json({ error: "Método no permitido." });
    return false;
  }
  return true;
}

export function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { throw new HttpError(400, "El formato de la solicitud no es válido."); }
  }
  return {};
}

export function sendError(res, error) {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  if (status >= 500) console.error("Pizzelle API request failed", error?.message || "unknown error");
  const message = status >= 500 ? "Ocurrió un error. Inténtalo de nuevo." : error.message;
  return res.status(status).json({ error: message });
}
