import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateConversionRate } from '@/lib/provider-utils';

export const useServicePerformance = (providerId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['service-performance', providerId, days],
    queryFn: async () => {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      
      // Fetch all services for this provider
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerId);
      
      if (servicesError) throw servicesError;
      
      if (!services || services.length === 0) {
        return [];
      }
      
      // Fetch bookings for each service
      const { data: bookings } = await supabase
        .from('bookings')
        .select('service_id, status, total_price, created_at')
        .in('service_id', services.map(s => s.id))
        .gte('created_at', dateFrom.toISOString());
      
      // Fetch views for each service
      const { data: views } = await supabase
        .from('service_views')
        .select('service_id')
        .in('service_id', services.map(s => s.id))
        .gte('viewed_at', dateFrom.toISOString());
      
      // Calculate performance metrics for each service
      const performance = services.map(service => {
        const serviceBookings = bookings?.filter(b => b.service_id === service.id) || [];
        const serviceViews = views?.filter(v => v.service_id === service.id) || [];
        
        const viewCount = serviceViews.length;
        const bookingCount = serviceBookings.length;
        const revenue = serviceBookings
          .filter(b => b.status === 'completed' || b.status === 'confirmed')
          .reduce((sum, b) => sum + (b.total_price || 0), 0);
        
        const conversionRate = calculateConversionRate(viewCount, bookingCount);
        
        return {
          id: service.id,
          name: service.title,
          image: service.image,
          views: viewCount,
          bookings: bookingCount,
          conversionRate,
          avgRating: service.rating || 0,
          revenue,
          available: service.available,
        };
      });
      
      // Sort by revenue descending
      return performance.sort((a, b) => b.revenue - a.revenue);
    },
    enabled: !!providerId,
    staleTime: 300000, // 5 minutes
  });
};
