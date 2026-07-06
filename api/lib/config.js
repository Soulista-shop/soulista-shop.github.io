export function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://ktaaodvqxiqqtlekneqj.supabase.co";
  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWFvZHZxeGlxcXRsZWtuZXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzUwMjIsImV4cCI6MjA3ODgxMTAyMn0.dawgkm2EeFa0UVp6dl-iUrppAqi2fvfGcxb3BRnvbfc";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, anonKey, serviceKey };
}

export function getR2PublicBase() {
  return (
    process.env.R2_PUBLIC_BASE_URL ||
    process.env.VITE_MEDIA_PUBLIC_BASE_URL ||
    "https://pub-b2e8b89bb29245d39698ff1c7c2eab0e.r2.dev"
  )
    .trim()
    .replace(/\/$/, "");
}

export function getR2EnvStatus() {
  return {
    hasAccessKeyId: Boolean(process.env.R2_ACCESS_KEY_ID),
    hasSecretAccessKey: Boolean(process.env.R2_SECRET_ACCESS_KEY),
    hasBucket: Boolean(process.env.R2_BUCKET || "soulista-media"),
    hasAccountId: Boolean(process.env.R2_ACCOUNT_ID || "15cd065a7eb4dbb50c158aa5584a0e8c"),
    hasCloudflareToken: Boolean(process.env.CLOUDFLARE_API_TOKEN || process.env.R2_API_TOKEN),
  };
}

export function urlToMediaPath(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const publicBase = getR2PublicBase();
  if (trimmed.startsWith(publicBase)) {
    return trimmed.slice(publicBase.length).replace(/^\//, "");
  }

  const legacyPrefix = "https://ktaaodvqxiqqtlekneqj.supabase.co/storage/v1/object/public/media/";
  if (trimmed.startsWith(legacyPrefix)) {
    return trimmed.slice(legacyPrefix.length);
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const pathname = new URL(trimmed).pathname;
      return pathname.replace(/^\//, "");
    } catch {
      return null;
    }
  }

  return trimmed.replace(/^\//, "");
}
