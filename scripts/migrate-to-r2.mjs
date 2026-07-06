/**
 * One-time migration: Supabase Storage (media) -> Cloudflare R2
 * Usage: set env vars (see scripts/.env.migration.example) then:
 *   node scripts/migrate-to-r2.mjs
 *   node scripts/migrate-to-r2.mjs --update-db
 */
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const OLD_PREFIX =
  process.env.OLD_PUBLIC_PREFIX ||
  "https://ktaaodvqxiqqtlekneqj.supabase.co/storage/v1/object/public/media/";
const NEW_PREFIX = process.env.NEW_PUBLIC_PREFIX;
const UPDATE_DB = process.argv.includes("--update-db");

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

const bucket = requireEnv("R2_BUCKET");

async function listAll(prefix = "") {
  const { data, error } = await supabase.storage.from("media").list(prefix, { limit: 1000 });
  if (error) throw error;

  const files = [];
  for (const item of data ?? []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      if (item.name === ".keep") continue;
      files.push(...(await listAll(path)));
    } else if (!item.name.startsWith(".")) {
      files.push(path);
    }
  }
  return files;
}

async function existsOnR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function copyFile(path) {
  if (await existsOnR2(path)) {
    console.log("skip (exists):", path);
    return;
  }

  const { data, error } = await supabase.storage.from("media").download(path);
  if (error) throw new Error(`${path}: ${error.message}`);

  const ext = path.split(".").pop()?.toLowerCase();
  const mime =
    ext === "webp"
      ? "image/webp"
      : ext === "png"
        ? "image/png"
        : ext === "gif"
          ? "image/gif"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : data.type || "application/octet-stream";

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: Buffer.from(await data.arrayBuffer()),
      ContentType: mime,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  console.log("copied:", path);
}

function replaceUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("/storage/v1/object/public/media/")) return url;
  if (!NEW_PREFIX) throw new Error("NEW_PUBLIC_PREFIX required for --update-db");
  return url.replace(OLD_PREFIX, NEW_PREFIX.endsWith("/") ? NEW_PREFIX : `${NEW_PREFIX}/`);
}

async function updateDatabase() {
  if (!NEW_PREFIX) throw new Error("Set NEW_PUBLIC_PREFIX before --update-db");

  const { data: products, error: pErr } = await supabase.from("products").select("id, main_image, images");
  if (pErr) throw pErr;

  let productUpdates = 0;
  for (const p of products ?? []) {
    const main = replaceUrl(p.main_image);
    const images = (p.images ?? []).map(replaceUrl);
    const changed =
      main !== p.main_image || JSON.stringify(images) !== JSON.stringify(p.images ?? []);
    if (!changed) continue;

    const { error } = await supabase.from("products").update({ main_image: main, images }).eq("id", p.id);
    if (error) throw error;
    productUpdates++;
    console.log("updated product:", p.id);
  }

  const { data: categories, error: cErr } = await supabase
    .from("category_settings")
    .select("id, frame_image, background_image");
  if (cErr) throw cErr;

  let categoryUpdates = 0;
  for (const c of categories ?? []) {
    const frame = replaceUrl(c.frame_image);
    const bg = replaceUrl(c.background_image);
    if (frame === c.frame_image && bg === c.background_image) continue;

    const { error } = await supabase
      .from("category_settings")
      .update({ frame_image: frame, background_image: bg })
      .eq("id", c.id);
    if (error) throw error;
    categoryUpdates++;
    console.log("updated category:", c.id);
  }

  console.log(`DB done: ${productUpdates} products, ${categoryUpdates} categories`);
}

async function main() {
  console.log("Listing Supabase media files...");
  const paths = await listAll();
  console.log(`Found ${paths.length} files`);

  for (const path of paths) {
    await copyFile(path);
  }
  console.log("R2 copy complete.");

  if (UPDATE_DB) {
    console.log("Updating database URLs...");
    await updateDatabase();
  } else {
    console.log("Skipping DB update (run with --update-db after setting NEW_PUBLIC_PREFIX)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
