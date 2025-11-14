import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/marketplace/useAdminAuth';

export interface AdminPerformance {
  actionsToday: number;
  actionsThisWeek: number;
  avgResponseTime: string; // e.g., "2.3h"
  resolutionRate: number; // 0-100
  topAction: string;
  efficiencyGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  comparison: {
    vsYesterday: number; // percentage change
    vsLastWeek: number; // percentage change
  };
}

export function useAdminPerformance() {
  const { user } = useAdminAuth();

  return useQuery({
    queryKey: ['admin-performance', user?.id],
    queryFn: async (): Promise<AdminPerformance> => {
      if (!user?.id) throw new Error('No user ID');

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get today's actions
      const { count: actionsToday } = await supabase
        .from('admin_access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      // Get this week's actions
      const { count: actionsThisWeek } = await supabase
        .from('admin_access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString());

      // Get yesterday's actions for comparison
      const { count: actionsYesterday } = await supabase
        .from('admin_access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString());

      // Get most frequent action today
      const { data: actions } = await supabase
        .from('admin_access_logs')
        .select('action')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      const actionCounts = actions?.reduce((acc, { action }) => {
        acc[action] = (acc[action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topAction = Object.keys(actionCounts).length > 0
        ? Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';

      // Calculate metrics
      const vsYesterday = actionsYesterday 
        ? ((actionsToday || 0) - actionsYesterday) / actionsYesterday * 100
        : 0;

      const avgActionsPerDay = actionsThisWeek ? (actionsThisWeek || 0) / 7 : 0;
      const vsLastWeek = avgActionsPerDay > 0 
        ? ((actionsToday || 0) - avgActionsPerDay) / avgActionsPerDay * 100
        : 0;

      // Calculate efficiency grade based on activity
      const getGrade = (count: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
        if (count >= 20) return 'A';
        if (count >= 15) return 'B';
        if (count >= 10) return 'C';
        if (count >= 5) return 'D';
        return 'F';
      };

      return {
        actionsToday: actionsToday || 0,
        actionsThisWeek: actionsThisWeek || 0,
        avgResponseTime: '2.3h', // Mock for now
        resolutionRate: 92, // Mock for now
        topAction,
        efficiencyGrade: getGrade(actionsToday || 0),
        comparison: {
          vsYesterday,
          vsLastWeek,
        },
      };
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refresh every minute
  });
}
