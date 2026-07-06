import { getSupabaseConfig, urlToMediaPath } from "./config.js";

export async function listMediaFromDatabase(folder = "") {
  const { url, anonKey, serviceKey } = getSupabaseConfig();
  const apiKey = serviceKey || anonKey;
  const headers = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  const [productsRes, categoriesRes] = await Promise.all([
    fetch(`${url}/rest/v1/products?select=main_image,images`, { headers }),
    fetch(`${url}/rest/v1/category_settings?select=frame_image,background_image`, { headers }),
  ]);

  if (!productsRes.ok) {
    throw new Error("Failed to load product images from database");
  }

  const products = await productsRes.json();
  const categories = categoriesRes.ok ? await categoriesRes.json() : [];

  const pathSet = new Set();

  for (const p of products ?? []) {
    const main = urlToMediaPath(p.main_image);
    if (main) pathSet.add(main);
    for (const img of p.images ?? []) {
      const path = urlToMediaPath(img);
      if (path) pathSet.add(path);
    }
  }

  for (const c of categories ?? []) {
    const frame = urlToMediaPath(c.frame_image);
    const bg = urlToMediaPath(c.background_image);
    if (frame) pathSet.add(frame);
    if (bg) pathSet.add(bg);
  }

  const normalizedFolder = folder ? folder.replace(/\/$/, "") : "";
  const folderSet = new Set();
  const files = [];

  for (const fullPath of pathSet) {
    if (fullPath.endsWith("/.keep")) continue;

    if (normalizedFolder) {
      if (!fullPath.startsWith(`${normalizedFolder}/`)) continue;
      const rest = fullPath.slice(normalizedFolder.length + 1);
      if (!rest || rest.includes("/")) continue;
      files.push({
        name: rest,
        path: fullPath,
        created_at: new Date().toISOString(),
      });
      continue;
    }

    const slash = fullPath.indexOf("/");
    if (slash === -1) {
      files.push({
        name: fullPath,
        path: fullPath,
        created_at: new Date().toISOString(),
      });
    } else {
      folderSet.add(fullPath.slice(0, slash));
    }
  }

  files.sort((a, b) => a.name.localeCompare(b.name));

  return {
    folders: [...folderSet].sort(),
    files,
    source: "database",
  };
}
