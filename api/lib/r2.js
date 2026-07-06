import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function getR2Bucket() {
  return process.env.R2_BUCKET || "soulista-media";
}

export function getPublicBaseUrl() {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) throw new Error("R2_PUBLIC_BASE_URL is not configured");
  return base.replace(/\/$/, "");
}

export function publicUrlForKey(key) {
  return `${getPublicBaseUrl()}/${key.replace(/^\//, "")}`;
}

export async function listMediaFolder(prefix = "") {
  const client = getR2Client();
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

  return { folders: [...new Set(folders)], files };
}

export async function uploadMediaObject(key, body, contentType) {
  const client = getR2Client();
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
  await client.send(
    new DeleteObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
    })
  );
}

export async function verifyAdmin(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const token = authHeader.slice(7);
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { ok: false, status: 500, error: "Server auth not configured" };
  }

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: serviceKey,
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
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
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
