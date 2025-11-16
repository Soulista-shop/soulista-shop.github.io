import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, Plus, Trash2 } from "lucide-react";

interface ContentSetting {
  id: string;
  section: string;
  text_content: string;
  font_size: string;
  font_family: string;
}

const sectionLabels: Record<string, string> = {
  hero_slogan: "Hero Slogan (Your Style, Your Soul)",
  hero_description: "Hero Description",
  about_title: "About Page Title",
  about_description: "About Page Description",
  mission_title: "Mission Title",
  mission_description: "Mission Description",
  vision_title: "Vision Title",
  vision_description: "Vision Description",
  logo_size: "Logo Size (Navigation)",
};

interface CustomFont {
  id: string;
  font_name: string;
  font_class: string;
}

const fontSizeOptions = [
  { value: "text-sm", label: "Small" },
  { value: "text-base", label: "Base" },
  { value: "text-lg", label: "Large" },
  { value: "text-xl", label: "Extra Large" },
  { value: "text-2xl", label: "2XL" },
  { value: "text-3xl", label: "3XL" },
  { value: "text-4xl", label: "4XL" },
  { value: "text-5xl", label: "5XL" },
  { value: "text-6xl", label: "6XL" },
  { value: "text-7xl", label: "7XL" },
  { value: "text-lg md:text-xl", label: "Large / XL (Responsive)" },
  { value: "text-xl md:text-2xl", label: "XL / 2XL (Responsive)" },
  { value: "text-2xl md:text-3xl", label: "2XL / 3XL (Responsive)" },
  { value: "text-3xl md:text-4xl", label: "3XL / 4XL (Responsive)" },
  { value: "text-4xl md:text-5xl", label: "4XL / 5XL (Responsive)" },
  { value: "text-5xl md:text-6xl", label: "5XL / 6XL (Responsive)" },
  { value: "text-4xl md:text-6xl", label: "4XL / 6XL (Responsive)" },
  { value: "text-5xl md:text-7xl", label: "5XL / 7XL (Responsive)" },
];

const fontFamilyOptions = [
  { value: "font-sans", label: "Sans Serif (Inter)" },
  { value: "font-serif", label: "Serif (Playfair Display)" },
  { value: "font-didot", label: "Didot (Bodoni Moda)" },
  { value: "font-bold", label: "Bold" },
  { value: "font-semibold", label: "Semi Bold" },
  { value: "font-medium", label: "Medium" },
  { value: "font-normal", label: "Normal" },
  { value: "font-light", label: "Light" },
  { value: "custom", label: "Custom Font (enter below)" },
];

export function ContentSettings() {
  const [settings, setSettings] = useState<ContentSetting[]>([]);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAddFont, setShowAddFont] = useState(false);
  const [newFont, setNewFont] = useState({ name: '', class: '' });
  const [customFont, setCustomFont] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
    fetchCustomFonts();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("content_settings" as any)
      .select("*")
      .order("section");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSettings((data as any) || []);
    }
    setLoading(false);
  };

  const fetchCustomFonts = async () => {
    const { data, error } = await supabase
      .from("custom_fonts" as any)
      .select("*")
      .order("font_name");

    if (!error && data) {
      setCustomFonts(data as any);
    }
  };

  const handleAddFont = async () => {
    if (!newFont.name || !newFont.class) {
      toast({ title: "Error", description: "Please fill in both fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("custom_fonts" as any)
      .insert([{ font_name: newFont.name, font_class: newFont.class }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Font added successfully" });
      setNewFont({ name: '', class: '' });
      setShowAddFont(false);
      fetchCustomFonts();
    }
  };

  const handleDeleteFont = async (id: string) => {
    if (!confirm("Delete this font?")) return;

    const { error } = await supabase
      .from("custom_fonts" as any)
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Font deleted" });
      fetchCustomFonts();
    }
  };

  const handleUpdate = async (setting: ContentSetting) => {
    setSaving(setting.id);
    const { error } = await supabase
      .from("content_settings" as any)
      .update({
        text_content: setting.text_content,
        font_size: setting.font_size,
        font_family: setting.font_family,
        updated_at: new Date().toISOString(),
      })
      .eq("id", setting.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Content updated successfully" });
    }
    setSaving(null);
  };

  const updateSetting = (id: string, field: keyof ContentSetting, value: string) => {
    setSettings(
      settings.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Custom Fonts Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Fonts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add custom fonts that will appear in all font dropdowns
              </p>
            </div>
            <Button onClick={() => setShowAddFont(!showAddFont)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Font
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddFont && (
            <Card className="border-2 border-primary">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Font Name</Label>
                    <Input
                      placeholder="e.g., Roboto"
                      value={newFont.name}
                      onChange={(e) => setNewFont({ ...newFont, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>CSS Class</Label>
                    <Input
                      placeholder="e.g., font-roboto"
                      value={newFont.class}
                      onChange={(e) => setNewFont({ ...newFont, class: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddFont} size="sm">Save Font</Button>
                  <Button onClick={() => setShowAddFont(false)} variant="outline" size="sm">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {customFonts.map((font) => (
              <div key={font.id} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{font.font_name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFont(font.id)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Management */}
      <Card>
        <CardHeader>
          <CardTitle>Website Content Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage text content, font sizes, and font styles for different sections of your website
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => (
            <Card key={setting.id} className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    {sectionLabels[setting.section] || setting.section}
                  </h3>
                </div>

                <div>
                  <Label htmlFor={`text-${setting.id}`}>
                    {setting.section === 'logo_size' ? 'Logo Size (height in pixels)' : 'Text Content'}
                  </Label>
                  {setting.section === 'logo_size' ? (
                    <Input
                      id={`text-${setting.id}`}
                      type="number"
                      value={setting.text_content}
                      onChange={(e) =>
                        updateSetting(setting.id, "text_content", e.target.value)
                      }
                      className="mt-1"
                      placeholder="16"
                    />
                  ) : setting.section.includes("description") ? (
                    <Textarea
                      id={`text-${setting.id}`}
                      value={setting.text_content}
                      onChange={(e) =>
                        updateSetting(setting.id, "text_content", e.target.value)
                      }
                      rows={4}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      id={`text-${setting.id}`}
                      value={setting.text_content}
                      onChange={(e) =>
                        updateSetting(setting.id, "text_content", e.target.value)
                      }
                      className="mt-1"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`size-${setting.id}`}>Font Size</Label>
                    <select
                      id={`size-${setting.id}`}
                      value={setting.font_size}
                      onChange={(e) =>
                        updateSetting(setting.id, "font_size", e.target.value)
                      }
                      className="w-full border rounded-md p-2 bg-background mt-1"
                    >
                      {fontSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor={`font-${setting.id}`}>Font Style</Label>
                    <select
                      id={`font-${setting.id}`}
                      value={setting.font_family}
                      onChange={(e) =>
                        updateSetting(setting.id, "font_family", e.target.value)
                      }
                      className="w-full border rounded-md p-2 bg-background mt-1"
                    >
                      {customFonts.map((font) => (
                        <option key={font.id} value={font.font_class}>
                          {font.font_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => handleUpdate(setting)}
                    disabled={saving === setting.id}
                    size="sm"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving === setting.id ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
