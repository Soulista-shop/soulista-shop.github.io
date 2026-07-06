import { listMediaFolder, verifyAdmin } from "./lib/r2.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await verifyAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  try {
    const folder = typeof req.query.folder === "string" ? req.query.folder : "";
    const result = await listMediaFolder(folder);
    return res.status(200).json(result);
  } catch (err) {
    console.error("media-list error:", err);
    return res.status(500).json({ error: err.message || "Failed to list media" });
  }
}
