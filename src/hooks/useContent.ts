import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ContentSetting {
  section: string;
  text_content: string;
  font_size: string;
  font_family: string;
}

export function useContent() {
  const [content, setContent] = useState<Record<string, ContentSetting>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("content_settings" as any)
      .select("*");

    if (!error && data) {
      const contentMap = (data as any[]).reduce((acc, item) => {
        acc[item.section] = item;
        return acc;
      }, {} as Record<string, ContentSetting>);
      setContent(contentMap);
    }
    setLoading(false);
  };

  const getContent = (section: string, defaultText: string = "", defaultSize: string = "text-base", defaultFont: string = "font-normal") => {
    const setting = content[section];
    return {
      text: setting?.text_content || defaultText,
      className: `${setting?.font_size || defaultSize} ${setting?.font_family || defaultFont}`,
    };
  };

  return { content, loading, getContent };
}
