-- Create unified admin dashboard stats function
CREATE OR REPLACE FUNCTION public.get_unified_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'zeppel', (SELECT public.get_zeppel_admin_stats()),
    'marketplace', jsonb_build_object(
      'products', jsonb_build_object(
        'total', (SELECT COUNT(*) FROM products),
        'low_stock', (SELECT COUNT(*) FROM products WHERE stock_quantity < 10 AND is_stock_item = true),
        'out_of_stock', (SELECT COUNT(*) FROM products WHERE stock_quantity = 0 AND is_stock_item = true)
      ),
      'auctions', jsonb_build_object(
        'total', (SELECT COUNT(*) FROM auctions WHERE status = 'active'),
        'ending_today', (SELECT COUNT(*) FROM auctions 
          WHERE status = 'active' 
          AND end_time::date = CURRENT_DATE),
        'ending_soon', (SELECT COUNT(*) FROM auctions 
          WHERE status = 'active' 
          AND end_time BETWEEN NOW() AND NOW() + INTERVAL '24 hours')
      ),
      'orders', jsonb_build_object(
        'pending', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
        'today', (SELECT COUNT(*) FROM orders WHERE created_at::date = CURRENT_DATE)
      ),
      'revenue', jsonb_build_object(
        'today', (SELECT COALESCE(SUM(total_amount), 0) FROM orders 
          WHERE created_at::date = CURRENT_DATE AND status = 'delivered'),
        'yesterday', (SELECT COALESCE(SUM(total_amount), 0) FROM orders 
          WHERE created_at::date = CURRENT_DATE - 1 AND status = 'delivered'),
        'week', (SELECT COALESCE(SUM(total_amount), 0) FROM orders 
          WHERE created_at >= CURRENT_DATE - 7 AND status = 'delivered')
      )
    ),
    'action_items', jsonb_build_object(
      'total', (
        (SELECT COUNT(*) FROM submissions WHERE status = 'pending') +
        (SELECT COUNT(*) FROM media_library WHERE status = 'pending') +
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') +
        (SELECT COUNT(*) FROM products WHERE stock_quantity < 10 AND is_stock_item = true)
      ),
      'submissions_pending', (SELECT COUNT(*) FROM submissions WHERE status = 'pending'),
      'media_pending', (SELECT COUNT(*) FROM media_library WHERE status = 'pending'),
      'orders_pending', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
      'low_stock_count', (SELECT COUNT(*) FROM products WHERE stock_quantity < 10 AND is_stock_item = true)
    ),
    'last_updated', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;