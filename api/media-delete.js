import { deleteMediaObject, verifyAdmin } from "./lib/r2.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await verifyAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  try {
    const path = typeof req.query.path === "string" ? req.query.path : req.body?.path;
    if (!path) {
      return res.status(400).json({ error: "path is required" });
    }

    await deleteMediaObject(path);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("media-delete error:", err);
    return res.status(500).json({ error: err.message || "Delete failed" });
  }
}
