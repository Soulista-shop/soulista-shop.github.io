import Busboy from "busboy";
import { uploadMediaObject, verifyAdmin } from "./lib/r2.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    const files = [];

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("file", (name, file, info) => {
      const chunks = [];
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("end", () => {
        files.push({
          field: name,
          filename: info.filename,
          mimeType: info.mimeType,
          buffer: Buffer.concat(chunks),
        });
      });
    });

    busboy.on("error", reject);
    busboy.on("finish", () => resolve({ fields, files }));
    req.pipe(busboy);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const { fields, files } = await parseMultipart(req);
    const folder = fields.folder || "";
    const uploaded = [];

    for (const file of files) {
      if (!file.filename) continue;
      const safeName = String(file.filename).replace(/[^\w.\-()+ ]/g, "_");
      const key = folder ? `${folder}/${safeName}` : safeName;
      const url = await uploadMediaObject(key, file.buffer, file.mimeType || "application/octet-stream");
      uploaded.push({ path: key, url });
    }

    if (uploaded.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    return res.status(200).json({ uploaded });
  } catch (err) {
    console.error("media-upload error:", err);
    const message = err?.message || "Upload failed";
    if (/Invalid character in header content/i.test(message)) {
      return res.status(500).json({
        error:
          "Upload auth header failed. Usually caused by newline characters in R2 or Supabase env vars on Vercel. Re-save R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY without spaces/newlines, then redeploy.",
      });
    }
    return res.status(500).json({ error: message });
  }
}
