import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProviderRevenue = (providerId: string) => {
  return useQuery({
    queryKey: ['provider-revenue', providerId],
    queryFn: async () => {
      // Get current and previous month dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      
      // Fetch all completed/confirmed bookings for revenue calculation
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('*, services!inner(provider_id, title)')
        .eq('services.provider_id', providerId)
        .in('status', ['completed', 'confirmed']);
      
      const totalRevenue = allBookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
      
      // Current month revenue
      const currentMonthBookings = allBookings?.filter(
        b => new Date(b.created_at) >= currentMonthStart
      ) || [];
      const currentMonthRevenue = currentMonthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      
      // Last month revenue for comparison
      const lastMonthBookings = allBookings?.filter(
        b => {
          const date = new Date(b.created_at);
          return date >= lastMonthStart && date <= lastMonthEnd;
        }
      ) || [];
      const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      
      // Calculate percentage change
      const monthChange = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;
      
      // Pending payouts (confirmed but not completed)
      const pendingBookings = allBookings?.filter(b => b.status === 'confirmed') || [];
      const pendingPayouts = pendingBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      
      // Average booking value
      const avgBookingValue = allBookings && allBookings.length > 0
        ? totalRevenue / allBookings.length
        : 0;
      
      // Revenue by service
      const revenueByService = allBookings?.reduce((acc, b) => {
        const serviceTitle = (b as any).services?.title || 'Unknown';
        if (!acc[serviceTitle]) {
          acc[serviceTitle] = { revenue: 0, count: 0 };
        }
        acc[serviceTitle].revenue += b.total_price || 0;
        acc[serviceTitle].count += 1;
        return acc;
      }, {} as Record<string, { revenue: number; count: number }>) || {};
      
      const topServices = Object.entries(revenueByService)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      return {
        totalRevenue,
        currentMonthRevenue,
        monthChange,
        pendingPayouts,
        avgBookingValue,
        topServices,
      };
    },
    enabled: !!providerId,
    staleTime: 300000, // 5 minutes
  });
};
