import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type CategorySettingRow = {
  id: string;
  category_name: string;
  frame_enabled: boolean;
  frame_image: string | null;
  background_image: string | null;
  background_opacity: number;
  background_blur: number;
  display_order?: number;
};

const CATEGORY_SETTINGS_KEY = ["category-settings"] as const;

export function useCategorySettings() {
  return useQuery({
    queryKey: CATEGORY_SETTINGS_KEY,
    queryFn: async (): Promise<CategorySettingRow[]> => {
      const { data, error } = await supabase
        .from("category_settings")
        .select(
          "id, category_name, frame_enabled, frame_image, background_image, background_opacity, background_blur, display_order"
        )
        .order("display_order", { ascending: true })
        .order("category_name", { ascending: true });

      if (error) throw error;
      return (data as CategorySettingRow[]) ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useCategorySettingsMap() {
  const query = useCategorySettings();
  const map = useMemo(() => {
    const byName = new Map<string, CategorySettingRow>();
    for (const row of query.data ?? []) {
      byName.set(row.category_name, row);
    }
    return byName;
  }, [query.data]);

  return { ...query, map };
}

export { CATEGORY_SETTINGS_KEY };
