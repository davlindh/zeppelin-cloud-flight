-- Add currency column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'SEK';

-- Add a comment explaining the column
COMMENT ON COLUMN public.orders.currency IS 'Currency code (ISO 4217) for the order, defaults to SEK';

-- Create an index for faster currency-based queries
CREATE INDEX IF NOT EXISTS idx_orders_currency ON public.orders(currency);