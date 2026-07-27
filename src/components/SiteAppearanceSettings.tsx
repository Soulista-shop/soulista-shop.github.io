import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { CONTENT_SETTINGS_KEY } from "@/hooks/useContent";
import {
  applySiteBackground,
  DEFAULT_SITE_BACKGROUND,
  normalizeHex,
  SITE_BACKGROUND_PRESETS,
  SITE_BACKGROUND_SECTION,
} from "@/lib/siteBackground";
import { cn } from "@/lib/utils";

interface ContentSetting {
  id: string;
  section: string;
  text_content: string;
}

export function SiteAppearanceSettings() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [setting, setSetting] = useState<ContentSetting | null>(null);
  const [customBackgroundHex, setCustomBackgroundHex] = useState(DEFAULT_SITE_BACKGROUND);

  const fetchBackground = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("content_settings" as any)
      .select("id, section, text_content")
      .eq("section", SITE_BACKGROUND_SECTION)
      .maybeSingle();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      const row = data as ContentSetting;
      setSetting(row);
      setCustomBackgroundHex(normalizeHex(row.text_content));
    } else {
      setSetting(null);
      setCustomBackgroundHex(DEFAULT_SITE_BACKGROUND);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchBackground();
  }, []);

  const currentSiteBackground = normalizeHex(setting?.text_content || DEFAULT_SITE_BACKGROUND);

  const handleSaveSiteBackground = async (hex: string) => {
    const color = normalizeHex(hex);
    setSaving(true);
    applySiteBackground(color);
    setCustomBackgroundHex(color);

    if (setting) {
      const { error } = await supabase
        .from("content_settings" as any)
        .update({
          text_content: color,
          updated_at: new Date().toISOString(),
        })
        .eq("id", setting.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setSetting({ ...setting, text_content: color });
        toast({ title: "Success", description: "Site background updated" });
        void queryClient.invalidateQueries({ queryKey: CONTENT_SETTINGS_KEY });
      }
    } else {
      const { data, error } = await supabase
        .from("content_settings" as any)
        .insert({
          section: SITE_BACKGROUND_SECTION,
          text_content: color,
          font_size: "text-base",
          font_family: "font-normal",
        })
        .select("id, section, text_content")
        .single();

      if (error) {
        toast({
          title: "Error",
          description:
            error.message +
            " — If this is the first time, run the site_background migration in Supabase SQL.",
          variant: "destructive",
        });
      } else {
        setSetting(data as ContentSetting);
        toast({ title: "Success", description: "Site background updated" });
        void queryClient.invalidateQueries({ queryKey: CONTENT_SETTINGS_KEY });
      }
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site background</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sets the background for the whole storefront, including header and footer.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3">Presets</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SITE_BACKGROUND_PRESETS.map((preset) => {
                const selected = currentSiteBackground === preset.hex;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setCustomBackgroundHex(preset.hex);
                      void handleSaveSiteBackground(preset.hex);
                    }}
                    className={cn(
                      "group flex flex-col items-stretch gap-2 rounded-lg border p-3 text-left transition-colors touch-manipulation",
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-foreground/30"
                    )}
                  >
                    <span
                      className="block h-16 w-full rounded-md border border-black/10 shadow-sm"
                      style={{ backgroundColor: preset.hex }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{preset.label}</span>
                    <span className="text-xs text-muted-foreground font-mono">{preset.hex}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <div>
              <p className="text-sm font-medium">Custom color</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick any color or paste a hex code (e.g. #FDF7EB).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="site-bg-picker">Palette</Label>
                <input
                  id="site-bg-picker"
                  type="color"
                  value={/^#[0-9A-F]{6}$/i.test(customBackgroundHex) ? customBackgroundHex : DEFAULT_SITE_BACKGROUND}
                  disabled={saving}
                  onChange={(e) => {
                    const next = normalizeHex(e.target.value);
                    setCustomBackgroundHex(next);
                    applySiteBackground(next);
                  }}
                  className="h-12 w-16 cursor-pointer rounded-md border border-border bg-background p-1 touch-manipulation"
                />
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                <Label htmlFor="site-bg-hex">Hex</Label>
                <Input
                  id="site-bg-hex"
                  value={customBackgroundHex}
                  disabled={saving}
                  onChange={(e) => {
                    const raw = e.target.value.trim().toUpperCase();
                    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
                    setCustomBackgroundHex(withHash);
                    if (/^#[0-9A-F]{6}$/i.test(withHash)) {
                      applySiteBackground(withHash);
                    }
                  }}
                  placeholder="#FFFFFF"
                  className="font-mono uppercase"
                  maxLength={7}
                />
              </div>
              <Button
                type="button"
                disabled={saving || !/^#[0-9A-F]{6}$/i.test(customBackgroundHex)}
                onClick={() => void handleSaveSiteBackground(customBackgroundHex)}
                className="min-h-10 sm:mb-0.5"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Apply custom"}
              </Button>
            </div>
            {!SITE_BACKGROUND_PRESETS.some((p) => p.hex === currentSiteBackground) ? (
              <p className="text-xs text-muted-foreground">
                Active: custom <span className="font-mono">{currentSiteBackground}</span>
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
