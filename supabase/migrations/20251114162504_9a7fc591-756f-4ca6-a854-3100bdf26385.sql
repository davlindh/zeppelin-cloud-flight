-- Update get_unified_admin_dashboard_stats function to include services stats
CREATE OR REPLACE FUNCTION public.get_unified_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'zeppel', (SELECT public.get_zeppel_admin_stats()),
    'marketplace', jsonb_build_object(
      'products', jsonb_build_object(
        'total', (SELECT COUNT(*) FROM products),
        'low_stock', (SELECT COUNT(*) FROM products WHERE stock_quantity <= 10 AND stock_quantity > 0),
        'out_of_stock', (SELECT COUNT(*) FROM products WHERE stock_quantity = 0)
      ),
      'auctions', jsonb_build_object(
        'total', (SELECT COUNT(*) FROM auctions),
        'ending_today', (
          SELECT COUNT(*) FROM auctions 
          WHERE end_time::date = CURRENT_DATE AND status = 'active'
        ),
        'ending_soon', (
          SELECT COUNT(*) FROM auctions 
          WHERE end_time BETWEEN NOW() AND NOW() + INTERVAL '24 hours' AND status = 'active'
        )
      ),
      'orders', jsonb_build_object(
        'pending', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
        'today', (SELECT COUNT(*) FROM orders WHERE created_at::date = CURRENT_DATE)
      ),
      'revenue', jsonb_build_object(
        'today', COALESCE((SELECT SUM(total_amount) FROM orders WHERE created_at::date = CURRENT_DATE), 0),
        'yesterday', COALESCE((SELECT SUM(total_amount) FROM orders WHERE created_at::date = CURRENT_DATE - 1), 0),
        'week', COALESCE((SELECT SUM(total_amount) FROM orders WHERE created_at >= CURRENT_DATE - 7), 0)
      )
    ),
    'services', jsonb_build_object(
      'providers', jsonb_build_object(
        'total', (SELECT COUNT(*) FROM service_providers),
        'with_services', (SELECT COUNT(DISTINCT provider_id) FROM services WHERE provider_id IS NOT NULL),
        'without_services', (SELECT COUNT(*) FROM service_providers 
          WHERE id NOT IN (SELECT DISTINCT provider_id FROM services WHERE provider_id IS NOT NULL))
      ),
      'services', jsonb_build_object(
        'total', (SELECT COUNT(*) FROM services),
        'linked', (SELECT COUNT(*) FROM services WHERE provider_id IS NOT NULL),
        'unlinked', (SELECT COUNT(*) FROM services WHERE provider_id IS NULL),
        'active', (SELECT COUNT(*) FROM services WHERE available = true),
        'inactive', (SELECT COUNT(*) FROM services WHERE available = false)
      ),
      'metrics', jsonb_build_object(
        'avg_services_per_provider', (
          SELECT COALESCE(AVG(service_count), 0)::numeric(10,2)
          FROM (
            SELECT COUNT(*) as service_count 
            FROM services 
            WHERE provider_id IS NOT NULL 
            GROUP BY provider_id
          ) provider_counts
        ),
        'providers_needing_attention', (
          SELECT COUNT(*) FROM service_providers sp
          WHERE sp.rating < 3.0 
          OR sp.reviews = 0
          OR (SELECT COUNT(*) FROM services s WHERE s.provider_id = sp.id) = 0
        )
      )
    ),
    'action_items', jsonb_build_object(
      'total', (
        (SELECT COUNT(*) FROM submissions WHERE status = 'pending') +
        (SELECT COUNT(*) FROM media_library WHERE status = 'pending') +
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') +
        (SELECT COUNT(*) FROM products WHERE stock_quantity <= 10 AND stock_quantity > 0) +
        (SELECT COUNT(*) FROM services WHERE provider_id IS NULL)
      ),
      'submissions_pending', (SELECT COUNT(*) FROM submissions WHERE status = 'pending'),
      'media_pending', (SELECT COUNT(*) FROM media_library WHERE status = 'pending'),
      'orders_pending', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
      'low_stock_count', (SELECT COUNT(*) FROM products WHERE stock_quantity <= 10 AND stock_quantity > 0),
      'unlinked_services', (SELECT COUNT(*) FROM services WHERE provider_id IS NULL)
    ),
    'last_updated', NOW()
  ) INTO result;
  
  RETURN result;
END;
$function$;