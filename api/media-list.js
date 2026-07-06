import { listMediaFolder, verifyAdmin } from "./lib/r2.js";
import { listMediaFromDatabase } from "./lib/media-db.js";
import { listMediaFolderViaCloudflareApi } from "./lib/r2-list-cf.js";

async function listMediaWithFallback(folder) {
  try {
    return await listMediaFolder(folder);
  } catch (err) {
    if (err.message !== "R2_S3_CREDENTIALS_MISSING") {
      console.warn("R2 S3 list failed, trying fallbacks:", err.message);
    }
  }

  try {
    const cfList = await listMediaFolderViaCloudflareApi(folder);
    if (cfList) return cfList;
  } catch (err) {
    console.warn("Cloudflare R2 list failed, trying database:", err.message);
  }

  return listMediaFromDatabase(folder);
}

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
    const result = await listMediaWithFallback(folder);
    return res.status(200).json(result);
  } catch (err) {
    console.error("media-list error:", err);
    return res.status(500).json({ error: err.message || "Failed to list media" });
  }
}
