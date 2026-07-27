-- Site-wide background color (hex) stored in content_settings
INSERT INTO public.content_settings (section, text_content, font_size, font_family)
VALUES ('site_background', '#FFFFFF', 'text-base', 'font-normal')
ON CONFLICT (section) DO NOTHING;

-- Allow admins to insert new content setting rows (e.g. if migration not run yet)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_settings'
      AND policyname = 'Admins can insert content settings'
  ) THEN
    CREATE POLICY "Admins can insert content settings"
      ON public.content_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
      );
  END IF;
END $$;
