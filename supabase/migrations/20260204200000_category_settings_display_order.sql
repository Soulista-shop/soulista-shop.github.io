-- Order categories in admin / shop filters (lower = first)
ALTER TABLE public.category_settings
ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY category_name) - 1)::integer AS ord
  FROM public.category_settings
)
UPDATE public.category_settings AS c
SET display_order = o.ord
FROM ordered AS o
WHERE c.id = o.id;
