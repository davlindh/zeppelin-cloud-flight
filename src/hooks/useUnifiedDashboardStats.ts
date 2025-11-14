import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedDashboardStats {
  zeppel: {
    submissions: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    participants: {
      total: number;
      with_profiles: number;
      public: number;
    };
    projects: {
      total: number;
    };
    media: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    sponsors: {
      total: number;
    };
  };
  marketplace: {
    products: {
      total: number;
      low_stock: number;
      out_of_stock: number;
    };
    auctions: {
      total: number;
      ending_today: number;
      ending_soon: number;
    };
    orders: {
      pending: number;
      today: number;
    };
    revenue: {
      today: number;
      yesterday: number;
      week: number;
    };
  };
  services: {
    providers: {
      total: number;
      with_services: number;
      without_services: number;
    };
    services: {
      total: number;
      linked: number;
      unlinked: number;
      active: number;
      inactive: number;
    };
    metrics: {
      avg_services_per_provider: number;
      providers_needing_attention: number;
    };
  };
  action_items: {
    total: number;
    submissions_pending: number;
    media_pending: number;
    orders_pending: number;
    low_stock_count: number;
    unlinked_services: number;
  };
  last_updated: string;
}

export function useUnifiedDashboardStats() {
  return useQuery({
    queryKey: ['unified-dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_unified_admin_dashboard_stats');
      
      if (error) throw error;
      
      return data as unknown as UnifiedDashboardStats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
