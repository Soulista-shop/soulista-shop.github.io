import { useEffect, type ReactNode } from "react";
import { useContent } from "@/hooks/useContent";
import {
  applySiteBackground,
  DEFAULT_SITE_BACKGROUND,
  normalizeHex,
  SITE_BACKGROUND_SECTION,
} from "@/lib/siteBackground";

/** Reads site background from content settings and applies it to the whole app. */
export function SiteBackgroundProvider({ children }: { children: ReactNode }) {
  const { content, loading } = useContent();

  useEffect(() => {
    const raw = content[SITE_BACKGROUND_SECTION]?.text_content;
    applySiteBackground(raw ? normalizeHex(raw) : DEFAULT_SITE_BACKGROUND);
  }, [content, loading]);

  return <>{children}</>;
}
