-- Add enhanced portfolio fields to service_portfolio_items
ALTER TABLE service_portfolio_items
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS project_date DATE,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS project_url TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS testimonial TEXT,
ADD COLUMN IF NOT EXISTS before_image TEXT,
ADD COLUMN IF NOT EXISTS after_image TEXT,
ADD COLUMN IF NOT EXISTS project_value NUMERIC(10, 2);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_provider ON service_portfolio_items(provider_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON service_portfolio_items(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON service_portfolio_items(category);

-- Add portfolio visibility fields to service_providers
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS portfolio_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS portfolio_description TEXT,
ADD COLUMN IF NOT EXISTS work_philosophy TEXT,
ADD COLUMN IF NOT EXISTS awards TEXT[],
ADD COLUMN IF NOT EXISTS years_in_business INTEGER;

-- Add comment explaining the structure
COMMENT ON COLUMN service_portfolio_items.images IS 'Array of additional image URLs for the portfolio item';
COMMENT ON COLUMN service_portfolio_items.tags IS 'Array of tags for filtering and categorization';
COMMENT ON COLUMN service_portfolio_items.featured IS 'Whether this portfolio item should be featured prominently';