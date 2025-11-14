import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PerformanceMetric } from '@/types/dashboard';
import { Clock, CheckCircle, Star, TrendingUp } from 'lucide-react';

export const useProviderPerformance = (providerId: string) => {
  return useQuery({
    queryKey: ['provider-performance', providerId],
    queryFn: async () => {
      // Get from view
      const { data: metrics, error } = await supabase
        .from('provider_performance_metrics')
        .select('*')
        .eq('provider_id', providerId)
        .single();
      
      if (error) throw error;
      
      // Calculate today's stats
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('id, service_id, services!inner(provider_id)')
        .eq('services.provider_id', providerId)
        .gte('created_at', new Date().toISOString().split('T')[0]);
      
      const actionsToday = todayBookings?.length || 0;
      
      // Format as PerformanceMetric[]
      const performanceMetrics: PerformanceMetric[] = [
        {
          label: 'Response Time',
          value: metrics.response_time || '24h',
          icon: Clock,
          trend: -5,
          progressValue: 85,
          variant: 'default',
        },
        {
          label: 'Acceptance Rate',
          value: `${metrics.acceptance_rate || 0}%`,
          icon: CheckCircle,
          trend: 3,
          progressValue: metrics.acceptance_rate || 0,
          variant: 'success',
        },
        {
          label: 'Average Rating',
          value: metrics.avg_rating?.toFixed(1) || '0.0',
          icon: Star,
          progressValue: (metrics.avg_rating || 0) * 20,
          variant: 'default',
        },
        {
          label: 'Bookings This Month',
          value: metrics.confirmed_bookings || 0,
          icon: TrendingUp,
          trend: 12,
          variant: 'success',
        },
      ];
      
      return {
        actionsToday,
        actionsThisWeek: metrics.total_bookings || 0,
        avgResponseTime: metrics.response_time || '24h',
        completionRate: metrics.acceptance_rate || 0,
        topAction: 'Service Bookings',
        grade: calculateGrade(metrics),
        metrics: performanceMetrics,
        comparison: {
          vsYesterday: 5,
          vsLastWeek: 12,
        },
      };
    },
    enabled: !!providerId,
    staleTime: 60000, // 1 minute
  });
};

function calculateGrade(metrics: any): 'A' | 'B' | 'C' | 'D' | 'F' {
  const score = 
    (metrics.acceptance_rate || 0) * 0.4 +
    (metrics.avg_rating || 0) * 20 * 0.6;
  
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
