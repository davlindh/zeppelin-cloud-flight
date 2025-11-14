import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AdminAnalytics {
  userRegistrations: AnalyticsDataPoint[];
  roleApplications: {
    provider: number;
    participant: number;
    customer: number;
  };
  revenue: AnalyticsDataPoint[];
  serviceProviderGrowth: AnalyticsDataPoint[];
  actionItems: {
    resolved: number;
    pending: number;
  };
}

export function useAdminAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['admin-analytics', days],
    queryFn: async (): Promise<AdminAnalytics> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Generate date range
      const dateRange: string[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dateRange.push(date.toISOString().split('T')[0]);
      }

      // Get user registrations (using admin_access_logs as proxy for demo)
      const { data: logsData } = await supabase
        .from('admin_access_logs')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      const registrationsByDate = dateRange.map(date => ({
        date,
        value: logsData?.filter(log => 
          log.created_at.startsWith(date)
        ).length || 0,
      }));

      // Get role applications count (mock for now)
      const roleApplications = {
        provider: Math.floor(Math.random() * 50) + 20,
        participant: Math.floor(Math.random() * 30) + 10,
        customer: Math.floor(Math.random() * 100) + 50,
      };

      // Get revenue data
      const { data: ordersData } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', startDate.toISOString())
        .eq('payment_status', 'paid');

      const revenueByDate = dateRange.map(date => ({
        date,
        value: ordersData
          ?.filter(order => order.created_at.startsWith(date))
          .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
      }));

      // Get service provider growth
      const { data: providersData } = await supabase
        .from('service_providers')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      let cumulativeProviders = 0;
      const providerGrowth = dateRange.map(date => {
        const newProviders = providersData?.filter(p => 
          p.created_at.startsWith(date)
        ).length || 0;
        cumulativeProviders += newProviders;
        return {
          date,
          value: cumulativeProviders,
        };
      });

      // Action items stats (mock)
      const actionItems = {
        resolved: Math.floor(Math.random() * 100) + 50,
        pending: Math.floor(Math.random() * 20) + 5,
      };

      return {
        userRegistrations: registrationsByDate,
        roleApplications,
        revenue: revenueByDate,
        serviceProviderGrowth: providerGrowth,
        actionItems,
      };
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}
