-- Shipping rates per destination (shown next to product prices on storefront)
CREATE TABLE IF NOT EXISTS public.shipping_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_name TEXT NOT NULL,
  price_le NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shipping_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping destinations are viewable by everyone"
  ON public.shipping_destinations
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert shipping destinations"
  ON public.shipping_destinations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update shipping destinations"
  ON public.shipping_destinations
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shipping destinations"
  ON public.shipping_destinations
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_shipping_destinations_updated_at
  BEFORE UPDATE ON public.shipping_destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
