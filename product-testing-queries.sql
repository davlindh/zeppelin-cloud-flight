-- ============================================
-- PRODUCT TESTING & VALIDATION QUERIES
-- ============================================
-- Run these queries to validate and test the updated product system

-- 1. Check current product status with all new fields
SELECT 
  id,
  title,
  product_brand,
  stock_quantity,
  in_stock,
  article_number,
  barcode,
  supplier,
  product_group,
  unit,
  category_id,
  (SELECT display_name FROM categories WHERE id = products.category_id) as category_name,
  rating,
  reviews,
  created_at
FROM products
ORDER BY created_at DESC
LIMIT 10;

-- 2. Update test product with complete data
UPDATE products 
SET 
  product_brand = 'CF-Moto',
  stock_quantity = 5,
  in_stock = true,
  article_number = 'TEST-001',
  barcode = '1234567890123',
  supplier = 'Test Supplier AB',
  product_group = 'Test Group',
  unit = 'pcs',
  rating = 4.5,
  reviews = 25,
  tags = ARRAY['test', 'electronics', 'featured'],
  features = ARRAY['High quality', 'Fast delivery', 'Warranty included'],
  description = 'En komplett testprodukt med alla fält ifyllda för att verifiera att admin-gränssnittet och butiken fungerar korrekt.',
  updated_at = NOW()
WHERE id = '8ac60dec-c5ad-4f34-8310-4192cf1edd31';

-- 3. Verify shop health diagnostics
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock_products,
  COUNT(CASE WHEN category_id IS NULL THEN 1 END) as products_without_category,
  COUNT(CASE WHEN product_brand IS NULL OR product_brand = '' THEN 1 END) as products_without_brand,
  COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as products_with_stock,
  AVG(stock_quantity) as avg_stock_quantity
FROM products
WHERE is_stock_item = true;

-- 4. List products by brand (for brand filter testing)
SELECT 
  product_brand,
  COUNT(*) as product_count,
  SUM(CASE WHEN in_stock THEN 1 ELSE 0 END) as in_stock_count
FROM products
WHERE product_brand IS NOT NULL AND product_brand != ''
GROUP BY product_brand
ORDER BY product_count DESC;

-- 5. Check for products with missing essential fields
SELECT 
  id,
  title,
  CASE 
    WHEN product_brand IS NULL OR product_brand = '' THEN 'Missing brand'
    WHEN category_id IS NULL THEN 'Missing category'
    WHEN stock_quantity = 0 AND in_stock = true THEN 'Stock mismatch'
    WHEN images IS NULL OR array_length(images, 1) = 0 THEN 'Missing images'
    ELSE 'Complete'
  END as status
FROM products
WHERE 
  product_brand IS NULL OR product_brand = '' OR
  category_id IS NULL OR
  (stock_quantity = 0 AND in_stock = true) OR
  images IS NULL OR array_length(images, 1) = 0
ORDER BY created_at DESC;
