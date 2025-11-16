import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface ContactSetting {
  id: string;
  setting_key: string;
  setting_value: string;
}

const settingLabels: Record<string, string> = {
  email_primary: "Primary Email",
  email_support: "Support Email",
  phone: "Phone Number",
  phone_hours: "Phone Hours",
  address_line1: "Address Line 1",
  address_line2: "Address Line 2 (City, State, ZIP)",
  address_line3: "Country",
  instagram: "Instagram URL",
  facebook: "Facebook URL",
};

export function ContactSettings() {
  const [settings, setSettings] = useState<ContactSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_settings" as any)
      .select("*")
      .order("setting_key");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSettings((data as any) || []);
    }
    setLoading(false);
  };

  const handleUpdate = async (setting: ContactSetting) => {
    setSaving(setting.id);
    const { error } = await supabase
      .from("contact_settings" as any)
      .update({
        setting_value: setting.setting_value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", setting.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Contact info updated successfully" });
    }
    setSaving(null);
  };

  const updateSetting = (id: string, value: string) => {
    setSettings(
      settings.map((s) => (s.id === id ? { ...s, setting_value: value } : s))
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact & Social Media Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your contact information and social media links
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <Card key={setting.id} className="border-2">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor={`setting-${setting.id}`}>
                  {settingLabels[setting.setting_key] || setting.setting_key}
                </Label>
                <Input
                  id={`setting-${setting.id}`}
                  value={setting.setting_value}
                  onChange={(e) => updateSetting(setting.id, e.target.value)}
                  className="mt-1"
                  placeholder={
                    setting.setting_key.includes('url') || setting.setting_key.includes('instagram') || setting.setting_key.includes('facebook')
                      ? 'https://...'
                      : setting.setting_key === 'email'
                      ? 'email@example.com'
                      : setting.setting_key === 'phone' || setting.setting_key === 'whatsapp'
                      ? '+20 123 456 7890'
                      : 'Enter value'
                  }
                />
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
  );
}
