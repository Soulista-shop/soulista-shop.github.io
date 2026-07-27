export const SITE_BACKGROUND_SECTION = "site_background";

export const SITE_BACKGROUND_PRESETS = [
  { id: "white", label: "White", hex: "#FFFFFF" },
  { id: "warm-cream", label: "Warm cream", hex: "#FDF7EB" },
  { id: "soft-sand", label: "Soft sand", hex: "#F7EFD9" },
  { id: "ivory", label: "Ivory", hex: "#FFFDF8" },
] as const;

export type SiteBackgroundPresetId = (typeof SITE_BACKGROUND_PRESETS)[number]["id"];

export const DEFAULT_SITE_BACKGROUND = SITE_BACKGROUND_PRESETS[0].hex;

export function normalizeHex(hex: string): string {
  const cleaned = hex.trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(cleaned)) return cleaned;
  if (/^[0-9A-F]{6}$/.test(cleaned)) return `#${cleaned}`;
  return DEFAULT_SITE_BACKGROUND;
}

/** Convert #RRGGBB to HSL channels used by this project's CSS variables (no hsl() wrapper). */
export function hexToHslChannels(hex: string): { h: number; s: number; l: number } {
  const normalized = normalizeHex(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function channel(h: number, s: number, l: number) {
  return `${h} ${s}% ${Math.min(100, Math.max(0, l))}%`;
}

/** Apply site background to CSS variables so header, pages, and footer stay coherent. */
export function applySiteBackground(hex: string) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const { h, s, l } = hexToHslChannels(hex);
  const bg = channel(h, s, l);

  root.style.setProperty("--background", bg);
  root.style.setProperty("--card", bg);
  root.style.setProperty("--popover", bg);
  // Slightly deeper for subtle section contrast (footer bands, muted panels)
  root.style.setProperty("--muted", channel(h, s, l - 3));
  root.style.setProperty("--secondary", channel(h, s, l - 4));
  root.style.setProperty("--accent", channel(h, s, l - 6));
  root.style.setProperty("--sidebar-background", channel(h, s, l - 2));
  root.style.setProperty(
    "--gradient-hero",
    `linear-gradient(180deg, hsl(${bg}), hsl(${channel(h, s, l - 2)}))`
  );
  root.style.setProperty(
    "--gradient-card",
    `linear-gradient(145deg, hsl(${bg}), hsl(${channel(h, s, l - 1)}))`
  );
  root.dataset.siteBackground = normalizeHex(hex);
}

export function presetIdForHex(hex: string): SiteBackgroundPresetId | null {
  const normalized = normalizeHex(hex);
  const match = SITE_BACKGROUND_PRESETS.find((p) => p.hex === normalized);
  return match?.id ?? null;
}
