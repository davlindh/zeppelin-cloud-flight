import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  products: {
    total: number;
    lowStock: number;
    inStock: number;
    outOfStock: number;
  };
  auctions: {
    total: number;
    active: number;
    endingToday: number;
    endingSoon: number;
  };
  services: {
    total: number;
    active: number;
    pending: number;
  };
  categories: {
    total: number;
    active: number;
    inactive: number;
  };
  providers: {
    total: number;
    verified: number;
    pending: number;
  };
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('📊 Fetching dashboard statistics...');
      
      try {
        // Fetch all data in parallel
        const [
          productsResult,
          auctionsResult,
          servicesResult,
          categoriesResult,
          providersResult
        ] = await Promise.all([
          // Products stats
          supabase
            .from('products')
            .select('stock_quantity, in_stock')
            .eq('is_stock_item', true),
          
          // Auctions stats
          supabase
            .from('auctions')
            .select('end_time, current_bid, starting_bid'),
          
          // Services stats
          supabase
            .from('services')
            .select('id, available, created_at'),
          
          // Categories stats
          supabase
            .from('categories')
            .select('is_active'),
          
          // Service providers stats (from services table for now)
          supabase
            .from('services')
            .select('provider, available')
        ]);

        const now = new Date();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const soonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Process products data
        const products = productsResult.data ?? [];
        const productStats = {
          total: products.length,
          lowStock: products.filter(p => p.stock_quantity && p.stock_quantity <= 10).length,
          inStock: products.filter(p => p.in_stock).length,
          outOfStock: products.filter(p => !p.in_stock).length,
        };

        // Process auctions data
        const auctions = auctionsResult.data ?? [];
        const auctionStats = {
          total: auctions.length,
          active: auctions.filter(a => {
            const endTime = new Date(a.end_time);
            return endTime > now;
          }).length,
          endingToday: auctions.filter(a => {
            const endTime = new Date(a.end_time);
            return endTime > now && endTime <= todayEnd;
          }).length,
          endingSoon: auctions.filter(a => {
            const endTime = new Date(a.end_time);
            return endTime > now && endTime <= soonThreshold;
          }).length,
        };

        // Process services data
        const services = servicesResult.data ?? [];
        const serviceStats = {
          total: services.length,
          active: services.filter(s => s.available === true).length,
          pending: services.filter(s => s.available === false).length,
        };

        // Process categories data
        const categories = categoriesResult.data ?? [];
        const categoryStats = {
          total: categories.length,
          active: categories.filter(c => c.is_active).length,
          inactive: categories.filter(c => !c.is_active).length,
        };

        // Process providers data (unique providers from services)
        const providers = providersResult.data ?? [];
        const allProviders = providers.map(s => s.provider).filter(Boolean);
        const uniqueProviders = [...new Set(allProviders)];
        const providerStats = {
          total: uniqueProviders.length,
          verified: uniqueProviders.length, // Assume all are verified for now
          pending: 0,
        };

        const stats: DashboardStats = {
          products: productStats,
          auctions: auctionStats,
          services: serviceStats,
          categories: categoryStats,
          providers: providerStats,
        };

        console.log('📊 Dashboard stats calculated:', stats);
        return stats;

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return default values on error
        return {
          products: { total: 0, lowStock: 0, inStock: 0, outOfStock: 0 },
          auctions: { total: 0, active: 0, endingToday: 0, endingSoon: 0 },
          services: { total: 0, active: 0, pending: 0 },
          categories: { total: 0, active: 0, inactive: 0 },
          providers: { total: 0, verified: 0, pending: 0 },
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for live updates
  });
};

// Hook for recent activity (placeholder for future implementation)
export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // This would fetch recent orders, bids, registrations, etc.
      // For now, return empty array
      return [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  });
};

// Hook for revenue data - now connected to real order data
export const useRevenueStats = () => {
  return useQuery({
    queryKey: ['revenue-stats'],
    queryFn: async () => {
      console.log('💰 Calculating revenue statistics...');
      
      try {
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Get today's revenue
        const { data: todayOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', today.toISOString().split('T')[0])
          .eq('status', 'delivered');

        // Get yesterday's revenue
        const { data: yesterdayOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', yesterday.toISOString().split('T')[0])
          .lt('created_at', today.toISOString().split('T')[0])
          .eq('status', 'delivered');

        // Get week's revenue
        const { data: weekOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', weekAgo.toISOString())
          .eq('status', 'delivered');

        // Get month's revenue
        const { data: monthOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', monthAgo.toISOString())
          .eq('status', 'delivered');

        const todayRevenue = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        const yesterdayRevenue = yesterdayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        const weekRevenue = weekOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        const monthRevenue = monthOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

        const growth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

        return {
          today: todayRevenue,
          yesterday: yesterdayRevenue,
          growth: Number(growth.toFixed(1)),
          week: weekRevenue,
          month: monthRevenue,
        };
      } catch (error) {
        console.error('Error calculating revenue stats:', error);
        // Return fallback data on error
        return {
          today: 0,
          yesterday: 0,
          growth: 0,
          week: 0,
          month: 0,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
