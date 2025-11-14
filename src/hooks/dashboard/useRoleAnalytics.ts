import { useQuery } from '@tanstack/react-query';
import { DashboardRole, ChartConfig } from '@/types/dashboard';

interface RoleAnalyticsData {
  charts: ChartConfig[];
  stats: {
    [key: string]: number;
  };
}

export function useRoleAnalytics(role: DashboardRole, days: number = 30) {
  return useQuery({
    queryKey: ['role-analytics', role, days],
    queryFn: async (): Promise<RoleAnalyticsData> => {
      // This is a generic hook that can be extended per role
      // Each role (admin, provider, participant, customer) can implement their own analytics logic
      
      // For now, return empty structure
      // Implementations should override this in role-specific hooks
      return {
        charts: [],
        stats: {},
      };
    },
    staleTime: 300000, // 5 minutes
  });
}
