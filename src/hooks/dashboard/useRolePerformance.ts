import { useQuery } from '@tanstack/react-query';
import { DashboardRole, PerformanceMetric } from '@/types/dashboard';

interface RolePerformanceData {
  actionsToday: number;
  actionsThisWeek: number;
  avgResponseTime: string;
  completionRate: number;
  topAction: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  metrics: PerformanceMetric[];
  comparison: {
    vsYesterday: number;
    vsLastWeek: number;
  };
}

export function useRolePerformance(role: DashboardRole, userId?: string) {
  return useQuery({
    queryKey: ['role-performance', role, userId],
    queryFn: async (): Promise<RolePerformanceData> => {
      // This is a generic hook that can be extended per role
      // Each role (admin, provider, participant, customer) can implement their own logic
      
      // For now, return mock data structure
      // Implementations should override this in role-specific hooks
      return {
        actionsToday: 0,
        actionsThisWeek: 0,
        avgResponseTime: '0h',
        completionRate: 0,
        topAction: 'N/A',
        grade: 'C',
        metrics: [],
        comparison: {
          vsYesterday: 0,
          vsLastWeek: 0,
        },
      };
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
}
