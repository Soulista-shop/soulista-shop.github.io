-- Product stock flags and available sizes (run on Supabase if not using CLI push)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS out_of_stock boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS almost_sold_out boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.products.out_of_stock IS 'When true, product cannot be purchased';
COMMENT ON COLUMN public.products.almost_sold_out IS 'When true, show low-stock messaging (ignored if out_of_stock)';
COMMENT ON COLUMN public.products.sizes IS 'List of size labels (e.g. S, M, L); empty means one-size / no size choice';
