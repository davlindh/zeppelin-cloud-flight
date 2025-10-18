-- First, alter the column to be nullable (it's currently NOT NULL with default '')
ALTER TABLE products 
ALTER COLUMN image DROP NOT NULL;

-- Now update empty strings to NULL
UPDATE products 
SET image = NULL 
WHERE image = '';

-- Add a trigger to prevent empty strings in the future
CREATE OR REPLACE FUNCTION validate_product_image()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If image is an empty string, set it to NULL
  IF NEW.image = '' THEN
    NEW.image := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate product images on INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_validate_product_image ON products;
CREATE TRIGGER trigger_validate_product_image
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_image();