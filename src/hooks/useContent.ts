import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ContentSetting {
  section: string;
  text_content: string;
  font_size: string;
  font_family: string;
}

export const CONTENT_SETTINGS_KEY = ["content-settings"] as const;

export function useContent() {
  const { data, isLoading } = useQuery({
    queryKey: CONTENT_SETTINGS_KEY,
    queryFn: async (): Promise<Record<string, ContentSetting>> => {
      const { data: rows, error } = await supabase.from("content_settings" as any).select("*");

      if (error) throw error;
      return (rows as ContentSetting[]).reduce(
        (acc, item) => {
          acc[item.section] = item;
          return acc;
        },
        {} as Record<string, ContentSetting>
      );
    },
    staleTime: 5 * 60_000,
  });

  const content = useMemo(() => data ?? {}, [data]);

  const getContent = (
    section: string,
    defaultText: string = "",
    defaultSize: string = "text-base",
    defaultFont: string = "font-normal"
  ) => {
    const setting = content[section];
    return {
      text: setting?.text_content || defaultText,
      className: `${setting?.font_size || defaultSize} ${setting?.font_family || defaultFont}`,
    };
  };

  return { content, loading: isLoading, getContent };
}
