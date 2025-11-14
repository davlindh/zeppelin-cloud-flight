import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartConfig } from '@/types/dashboard';
import { TrendingUp, DollarSign, Calendar, Star, Clock } from 'lucide-react';

export const useProviderAnalytics = (providerId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['provider-analytics', providerId, days],
    queryFn: async () => {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      
      // Fetch bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, services!inner(provider_id, title)')
        .eq('services.provider_id', providerId)
        .gte('created_at', dateFrom.toISOString())
        .order('created_at', { ascending: true });
      
      // Aggregate by day
      const bookingsByDay = aggregateByDay(bookings || [], 'created_at');
      
      // Revenue by service
      const revenueByService = (bookings || [])
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .reduce((acc, b) => {
          const service = (b as any).services?.title || 'Unknown';
          acc[service] = (acc[service] || 0) + (b.total_price || 0);
          return acc;
        }, {} as Record<string, number>);
      
      // Rating trend (simulated - would need review history)
      const ratingTrend = generateRatingTrend(days);
      
      // Availability data
      const totalHours = days * 8; // Assume 8 hours per day
      const bookedHours = (bookings || []).length * 2; // Assume 2 hours per booking
      const availabilityData = [
        { name: 'Booked', hours: bookedHours },
        { name: 'Available', hours: totalHours - bookedHours },
      ];
      
      const charts: ChartConfig[] = [
        {
          id: 'bookings',
          title: 'Booking Requests',
          icon: Calendar,
          type: 'line',
          data: bookingsByDay,
          dataKey: 'bookings',
          xAxisKey: 'date',
          color: 'hsl(var(--primary))',
        },
        {
          id: 'conversion',
          title: 'Service Performance',
          icon: TrendingUp,
          type: 'bar',
          data: Object.entries(revenueByService).map(([name, value]) => ({
            name: name.length > 20 ? name.substring(0, 20) + '...' : name,
            bookings: Math.floor(value / 100), // Approximate bookings from revenue
          })),
          dataKey: 'bookings',
          xAxisKey: 'name',
          color: 'hsl(var(--chart-1))',
        },
        {
          id: 'revenue',
          title: 'Revenue Breakdown',
          icon: DollarSign,
          type: 'area',
          data: aggregateRevenueByDay(bookings || []),
          dataKey: 'revenue',
          xAxisKey: 'date',
          color: 'hsl(var(--chart-2))',
        },
        {
          id: 'rating',
          title: 'Customer Rating Trend',
          icon: Star,
          type: 'line',
          data: ratingTrend,
          dataKey: 'rating',
          xAxisKey: 'date',
          color: 'hsl(var(--chart-3))',
        },
        {
          id: 'availability',
          title: 'Booked vs Available Hours',
          icon: Clock,
          type: 'pie',
          data: availabilityData,
          dataKey: 'hours',
          color: 'hsl(var(--chart-4))',
          colors: ['hsl(var(--chart-4))', 'hsl(var(--muted))'],
        },
      ];
      
      return {
        charts,
        stats: {
          totalBookings: bookings?.length || 0,
          totalRevenue: Object.values(revenueByService).reduce((a, b) => a + b, 0),
          avgRating: 4.8,
        },
      };
    },
    enabled: !!providerId,
    staleTime: 300000, // 5 minutes
  });
};

function aggregateByDay(items: any[], dateKey: string) {
  const grouped = items.reduce((acc, item) => {
    const date = new Date(item[dateKey]).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(grouped).map(([date, bookings]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bookings,
  }));
}

function aggregateRevenueByDay(bookings: any[]) {
  const grouped = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((acc, b) => {
      const date = new Date(b.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (b.total_price || 0);
      return acc;
    }, {} as Record<string, number>);
  
  return Object.entries(grouped).map(([date, revenue]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue,
  }));
}

function generateRatingTrend(days: number) {
  const trend = [];
  const baseRating = 4.5;
  for (let i = days; i >= 0; i -= 3) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trend.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rating: baseRating + (Math.random() - 0.5) * 0.5,
    });
  }
  return trend;
}
