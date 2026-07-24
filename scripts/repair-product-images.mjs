/**
 * Repair product image URLs: fix folder paths, drop missing R2 files.
 * Run: node scripts/repair-product-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const R2_PUBLIC_BASE =
  process.env.R2_PUBLIC_BASE_URL ||
  process.env.VITE_MEDIA_PUBLIC_BASE_URL ||
  "https://pub-b2e8b89bb29245d39698ff1c7c2eab0e.r2.dev";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const supabase = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});

async function listAllR2Keys() {
  const keys = [];
  let token;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: requireEnv("R2_BUCKET"),
        ContinuationToken: token,
        MaxKeys: 1000,
      })
    );
    keys.push(...(res.Contents ?? []).map((o) => o.Key));
    token = res.NextContinuationToken;
  } while (token);
  return keys;
}

function pathFromUrl(url) {
  if (!url) return null;
  const base = R2_PUBLIC_BASE.replace(/\/$/, "");
  if (url.startsWith(base)) return url.slice(base.length).replace(/^\//, "");
  return null;
}

function urlFromPath(path) {
  return `${R2_PUBLIC_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function resolvePath(path, keyByBasename) {
  const res = await fetch(urlFromPath(path), { method: "HEAD" });
  if (res.ok) return path;

  const basename = path.split("/").pop()?.toLowerCase();
  const alt = basename ? keyByBasename.get(basename) : null;
  if (alt) {
    const altOk = await fetch(urlFromPath(alt), { method: "HEAD" });
    if (altOk.ok) return alt;
  }
  return null;
}

async function main() {
  const keys = await listAllR2Keys();
  const keyByBasename = new Map();
  for (const key of keys) {
    const base = key.split("/").pop()?.toLowerCase();
    if (base && !keyByBasename.has(base)) keyByBasename.set(base, key);
  }

  const { data: products, error } = await supabase.from("products").select("id, name, main_image, images");
  if (error) throw error;

  let updated = 0;
  for (const p of products ?? []) {
    const rawUrls = [p.main_image, ...(p.images ?? [])].filter(Boolean);
    const fixedPaths = [];

    for (const url of rawUrls) {
      const path = pathFromUrl(url);
      if (!path) {
        fixedPaths.push(url);
        continue;
      }
      const resolved = await resolvePath(path, keyByBasename);
      if (resolved) {
        const fixedUrl = urlFromPath(resolved);
        if (!fixedPaths.includes(fixedUrl)) fixedPaths.push(fixedUrl);
      } else {
        console.log("removed missing:", p.name, path);
      }
    }

    let main = p.main_image;
    if (main && pathFromUrl(main)) {
      const resolved = await resolvePath(pathFromUrl(main), keyByBasename);
      main = resolved ? urlFromPath(resolved) : fixedPaths[0] ?? "";
    } else if (main && !fixedPaths.includes(main)) {
      main = fixedPaths[0] ?? "";
    }

    const images = fixedPaths.length > 0 ? fixedPaths : main ? [main] : [];
    const normalizedMain = main && images.includes(main) ? main : images[0] ?? "";

    const changed =
      normalizedMain !== (p.main_image ?? "") ||
      JSON.stringify(images) !== JSON.stringify(p.images ?? []);

    if (!changed) continue;

    const { error: upErr } = await supabase
      .from("products")
      .update({ main_image: normalizedMain || null, images })
      .eq("id", p.id);

    if (upErr) throw upErr;
    updated++;
    console.log("updated:", p.name, "images:", images.length);
  }

  console.log(`Done. Updated ${updated} products.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
