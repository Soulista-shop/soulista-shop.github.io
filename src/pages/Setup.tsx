import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function Setup() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runSetup = async () => {
    setLoading(true);
    setStatus([]);
    setError(null);

    try {
      // Check if table exists
      setStatus(prev => [...prev, "Checking if content_settings table exists..."]);
      const { data: existingData, error: checkError } = await supabase
        .from("content_settings" as any)
        .select("*")
        .limit(1);

      if (!checkError) {
        setStatus(prev => [...prev, "✅ Table already exists!"]);
        toast({ title: "Success", description: "Content settings table already exists" });
        setLoading(false);
        return;
      }

      // Create table using RPC or direct SQL
      setStatus(prev => [...prev, "Creating content_settings table..."]);
      
      // Insert default content
      const defaultContent = [
        { section: 'hero_slogan', text_content: 'Your Style, Your Soul', font_size: 'text-4xl md:text-5xl', font_family: 'font-didot' },
        { section: 'hero_description', text_content: 'Wear what makes you feel radiant, confident, and uniquely you, with every touch, every stitch, crafted to embrace your femininity and bring warmth, joy, and elegance to your life.', font_size: 'text-lg md:text-xl', font_family: 'font-sans' },
        { section: 'about_title', text_content: 'Our Story', font_size: 'text-4xl md:text-6xl', font_family: 'font-bold' },
        { section: 'about_description', text_content: 'Soulista was born from a passion to create clothing that celebrates the modern woman\'s spirit', font_size: 'text-lg md:text-xl', font_family: 'font-normal' },
        { section: 'mission_title', text_content: 'Our Mission', font_size: 'text-3xl md:text-4xl', font_family: 'font-bold' },
        { section: 'mission_description', text_content: 'We believe that every woman deserves to feel confident, comfortable, and beautiful in what she wears. Our mission is to create timeless pieces that empower women to express their unique style while embracing comfort and quality.', font_size: 'text-lg', font_family: 'font-normal' },
        { section: 'vision_title', text_content: 'The Soulista Vision', font_size: 'text-3xl md:text-4xl', font_family: 'font-bold' },
        { section: 'vision_description', text_content: 'We believe that modern women deserve clothing that empowers them to feel confident, comfortable, and stylish in every moment of their day.', font_size: 'text-lg', font_family: 'font-normal' }
      ];

      setStatus(prev => [...prev, "Table needs to be created manually in Supabase Dashboard"]);
      setError("Please run the SQL migration in Supabase Dashboard. See instructions below.");
      
    } catch (err: any) {
      setError(err.message);
      setStatus(prev => [...prev, `❌ Error: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Content Management Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-4">
                This will set up the content management system for your website.
              </p>
              <Button onClick={runSetup} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Setup Status
              </Button>
            </div>

            {status.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Status:</h3>
                {status.map((msg, idx) => (
                  <div key={idx} className="text-sm flex items-start gap-2">
                    {msg.startsWith("✅") ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : msg.startsWith("❌") ? (
                      <XCircle className="h-4 text-red-500 mt-0.5" />
                    ) : null}
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Manual Setup Required</h3>
                  <p className="text-sm mb-4">
                    You need to run this SQL in your Supabase Dashboard:
                  </p>
                  <div className="bg-background p-4 rounded-md overflow-x-auto">
                    <pre className="text-xs">
{`-- Create content_settings table
CREATE TABLE IF NOT EXISTS content_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT UNIQUE NOT NULL,
  text_content TEXT NOT NULL,
  font_size TEXT DEFAULT 'text-4xl md:text-5xl',
  font_family TEXT DEFAULT 'font-didot',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default content
INSERT INTO content_settings (section, text_content, font_size, font_family) VALUES
  ('hero_slogan', 'Your Style, Your Soul', 'text-4xl md:text-5xl', 'font-didot'),
  ('hero_description', 'Wear what makes you feel radiant, confident, and uniquely you, with every touch, every stitch, crafted to embrace your femininity and bring warmth, joy, and elegance to your life.', 'text-lg md:text-xl', 'font-sans'),
  ('about_title', 'Our Story', 'text-4xl md:text-6xl', 'font-bold'),
  ('about_description', 'Soulista was born from a passion to create clothing that celebrates the modern woman''s spirit', 'text-lg md:text-xl', 'font-normal'),
  ('mission_title', 'Our Mission', 'text-3xl md:text-4xl', 'font-bold'),
  ('mission_description', 'We believe that every woman deserves to feel confident, comfortable, and beautiful in what she wears. Our mission is to create timeless pieces that empower women to express their unique style while embracing comfort and quality.', 'text-lg', 'font-normal'),
  ('vision_title', 'The Soulista Vision', 'text-3xl md:text-4xl', 'font-bold'),
  ('vision_description', 'We believe that modern women deserve clothing that empowers them to feel confident, comfortable, and stylish in every moment of their day.', 'text-lg', 'font-normal')
ON CONFLICT (section) DO NOTHING;

-- Enable RLS
ALTER TABLE content_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read
CREATE POLICY "Anyone can read content settings" ON content_settings
  FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Admins can update content settings" ON content_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );`}
                    </pre>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold">Steps:</p>
                    <ol className="text-sm list-decimal list-inside space-y-1">
                      <li>Ask the account owner (lovable) for Supabase access</li>
                      <li>Go to: <a href="https://supabase.com/dashboard/project/qwcddnoieksbunyuotww/editor" target="_blank" className="text-blue-600 underline">Supabase SQL Editor</a></li>
                      <li>Click "New Query"</li>
                      <li>Copy and paste the SQL above</li>
                      <li>Click "Run" or press Ctrl+Enter</li>
                      <li>Refresh this page and click "Check Setup Status" again</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
