import { requireUser } from "../../server/auth.js";
import { allowMethods, sendError } from "../../server/http.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  try {
    const user = await requireUser(req);
    return res.status(200).json({ user: { id: user.id, email: user.email }, profile: { fullName: user.fullName, role: user.role } });
  } catch (error) { return sendError(res, error); }
}
