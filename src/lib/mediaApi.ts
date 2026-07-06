import { supabase } from "@/lib/supabase";

const MEDIA_BASE =
  import.meta.env.VITE_MEDIA_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  "https://pub-b2e8b89bb29245d39698ff1c7c2eab0e.r2.dev";

export function getMediaPublicUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${MEDIA_BASE}/${path.replace(/^\//, "")}`;
}

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

export interface MediaListFile {
  name: string;
  path: string;
  created_at: string;
}

export async function listMediaFiles(folder = ""): Promise<{
  folders: string[];
  files: MediaListFile[];
}> {
  const headers = await authHeaders();
  const qs = folder ? `?folder=${encodeURIComponent(folder)}` : "";
  const res = await fetch(`/api/media-list${qs}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to list media");
  return data;
}

export async function uploadMediaFiles(folder: string, files: File[]): Promise<void> {
  const headers = await authHeaders();
  const form = new FormData();
  form.append("folder", folder);
  for (const file of files) {
    form.append("file", file, file.name);
  }
  const res = await fetch("/api/media-upload", { method: "POST", headers, body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
}

export async function deleteMediaFile(path: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`/api/media-delete?path=${encodeURIComponent(path)}`, {
    method: "DELETE",
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Delete failed");
}
