import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getR2Credentials, getR2PublicBase, getSupabaseConfig } from "./config.js";

export function getR2Client() {
  const { accountId, accessKeyId, secretAccessKey } = getR2Credentials();

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function getR2Bucket() {
  return getR2Credentials().bucket;
}

export function getPublicBaseUrl() {
  return getR2PublicBase();
}

export function publicUrlForKey(key) {
  return `${getPublicBaseUrl()}/${key.replace(/^\//, "")}`;
}

export async function listMediaFolder(prefix = "") {
  const client = getR2Client();
  if (!client) {
    throw new Error("R2_S3_CREDENTIALS_MISSING");
  }

  const bucket = getR2Bucket();
  const normalized = prefix ? `${prefix.replace(/\/$/, "")}/` : "";

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: normalized,
      Delimiter: "/",
    })
  );

  const folders = (response.CommonPrefixes ?? [])
    .map((p) => {
      const full = (p.Prefix ?? "").slice(normalized.length).replace(/\/$/, "");
      return full.split("/")[0];
    })
    .filter(Boolean);

  const files = (response.Contents ?? [])
    .filter((obj) => obj.Key && obj.Key !== normalized && !obj.Key.endsWith("/.keep"))
    .map((obj) => {
      const key = obj.Key;
      const name = key.slice(normalized.length);
      if (name.includes("/")) return null;
      return {
        name,
        path: prefix ? `${prefix}/${name}` : name,
        created_at: obj.LastModified?.toISOString() ?? new Date().toISOString(),
      };
    })
    .filter(Boolean);

  return { folders: [...new Set(folders)], files, source: "r2-s3" };
}

export async function uploadMediaObject(key, body, contentType) {
  const client = getR2Client();
  if (!client) {
    throw new Error("R2 credentials are not configured on the server. Add R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in Vercel environment variables.");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return publicUrlForKey(key);
}

export async function deleteMediaObject(key) {
  const client = getR2Client();
  if (!client) {
    throw new Error("R2 credentials are not configured on the server.");
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
    })
  );
}

export async function verifyAdmin(req) {
  const authHeader = (req.headers.authorization || req.headers.Authorization || "").trim();
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const token = authHeader.slice(7).trim();
  if (!token || /[\r\n]/.test(token)) {
    return { ok: false, status: 401, error: "Invalid session token" };
  }

  const { url: supabaseUrl, anonKey, serviceKey } = getSupabaseConfig();
  const apiKey = serviceKey || anonKey;

  if (!supabaseUrl || !apiKey) {
    return { ok: false, status: 500, error: "Server auth not configured" };
  }

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: apiKey,
    },
  });

  if (!userRes.ok) {
    return { ok: false, status: 401, error: "Invalid session" };
  }

  const user = await userRes.json();
  const roleRes = await fetch(
    `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${user.id}&role=eq.admin&select=role`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: apiKey,
      },
    }
  );

  if (!roleRes.ok) {
    return { ok: false, status: 500, error: "Failed to verify admin role" };
  }

  const roles = await roleRes.json();
  if (!Array.isArray(roles) || roles.length === 0) {
    return { ok: false, status: 403, error: "Admin access required" };
  }

  return { ok: true };
}
