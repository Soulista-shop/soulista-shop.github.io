-- Snapshot of chosen shipping area on each order (grand total = items + shipping_fee_le)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_place_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_fee_le numeric(10, 2) NOT NULL DEFAULT 0;
