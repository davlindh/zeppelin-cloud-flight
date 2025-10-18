-- Backfill slugs for existing products
UPDATE products 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(title, '[åä]', 'a', 'g'),
      'ö', 'o', 'g'
    ),
    '[^a-z0-9\s]', '', 'g'
  )
)
WHERE slug IS NULL;

-- Ensure unique slugs for products
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  FOR rec IN 
    SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM products 
    WHERE slug IS NOT NULL
  LOOP
    IF rec.rn > 1 THEN
      counter := rec.rn - 1;
      new_slug := rec.slug || '-' || counter;
      UPDATE products SET slug = new_slug WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

-- Backfill slugs for existing services
UPDATE services 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(title, '[åä]', 'a', 'g'),
      'ö', 'o', 'g'
    ),
    '[^a-z0-9\s]', '', 'g'
  )
)
WHERE slug IS NULL;

-- Ensure unique slugs for services
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  FOR rec IN 
    SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM services 
    WHERE slug IS NOT NULL
  LOOP
    IF rec.rn > 1 THEN
      counter := rec.rn - 1;
      new_slug := rec.slug || '-' || counter;
      UPDATE services SET slug = new_slug WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

-- Backfill slugs for existing auctions
UPDATE auctions 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(title, '[åä]', 'a', 'g'),
      'ö', 'o', 'g'
    ),
    '[^a-z0-9\s]', '', 'g'
  )
)
WHERE slug IS NULL;

-- Ensure unique slugs for auctions
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  FOR rec IN 
    SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM auctions 
    WHERE slug IS NOT NULL
  LOOP
    IF rec.rn > 1 THEN
      counter := rec.rn - 1;
      new_slug := rec.slug || '-' || counter;
      UPDATE auctions SET slug = new_slug WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;