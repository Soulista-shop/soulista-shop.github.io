-- Create content_settings table for managing website text content
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
  FOR SELECT
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update content settings" ON content_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
