const imageModules = import.meta.glob("/src/assets/products/*", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export function resolveProductImage(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path;
  const filename = path.split("/").pop()!;
  const match = Object.keys(imageModules).find((k) => k.endsWith(`/${filename}`));
  return match ? imageModules[match] : path;
}

export function resolveProductImages(mainImage?: string, images?: string[] | null): string[] {
  const list = images && images.length > 0 ? images : mainImage ? [mainImage] : [];
  return list.map(resolveProductImage).filter(Boolean);
}
