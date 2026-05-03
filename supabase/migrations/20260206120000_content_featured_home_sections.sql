-- Home: featured products block heading and subtext (editable in Admin > Content)
INSERT INTO public.content_settings (section, text_content, font_size, font_family)
VALUES
  (
    'featured_section_title',
    'Featured Pieces',
    'text-3xl md:text-4xl',
    'font-bold'
  ),
  (
    'featured_section_description',
    'Meet your go-to summer outfits—colorful, comfy, and made for every summer moment.',
    'text-base',
    'font-sans'
  )
ON CONFLICT (section) DO NOTHING;
