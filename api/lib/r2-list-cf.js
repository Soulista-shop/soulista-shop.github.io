import { getR2PublicBase } from "./config.js";

const ACCOUNT_ID = () => process.env.R2_ACCOUNT_ID || "15cd065a7eb4dbb50c158aa5584a0e8c";
const BUCKET = () => process.env.R2_BUCKET || "soulista-media";

function getCfToken() {
  return process.env.CLOUDFLARE_API_TOKEN || process.env.R2_API_TOKEN;
}

export async function listMediaFolderViaCloudflareApi(folder = "") {
  const token = getCfToken();
  if (!token) return null;

  const prefix = folder ? `${folder.replace(/\/$/, "")}/` : "";
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID()}/r2/buckets/${BUCKET()}/objects/list`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix, delimiter: "/", limit: 1000 }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudflare R2 list failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || "Cloudflare R2 list failed");
  }

  const result = data.result ?? {};
  const folders = (result.delimited_prefixes ?? [])
    .map((p) => p.slice(prefix.length).replace(/\/$/, "").split("/")[0])
    .filter(Boolean);

  const files = (result.objects ?? [])
    .filter((obj) => obj.key && !obj.key.endsWith("/.keep"))
    .map((obj) => {
      const name = obj.key.slice(prefix.length);
      if (!name || name.includes("/")) return null;
      return {
        name,
        path: folder ? `${folder}/${name}` : name,
        created_at: obj.uploaded ?? new Date().toISOString(),
      };
    })
    .filter(Boolean);

  return {
    folders: [...new Set(folders)],
    files,
    source: "r2-cloudflare-api",
    publicBase: getR2PublicBase(),
  };
}
