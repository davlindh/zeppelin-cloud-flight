import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemHealth {
  dbResponseTime: number; // milliseconds
  apiUptime: number; // percentage 0-100
  storageUsed: number; // bytes
  storageMax: number; // bytes
  activeSessions: number;
  errorRate: number; // percentage 0-100
  healthScore: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealth> => {
      const startTime = performance.now();
      
      // Test DB response time
      await supabase.from('admin_access_logs').select('id', { head: true, count: 'exact' }).limit(1);
      const dbResponseTime = performance.now() - startTime;

      // Get error count from last hour
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { count: totalLogs } = await supabase
        .from('admin_access_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo);

      // Mock some metrics (in real app, these would come from monitoring service)
      const errorRate = Math.random() * 2; // 0-2% error rate
      const apiUptime = 99.5 + Math.random() * 0.5; // 99.5-100%
      const storageUsed = 2.5 * 1024 * 1024 * 1024; // 2.5 GB
      const storageMax = 10 * 1024 * 1024 * 1024; // 10 GB
      const activeSessions = Math.floor(Math.random() * 50) + 10; // 10-60 sessions

      // Calculate health score
      const dbScore = dbResponseTime < 100 ? 100 : Math.max(0, 100 - (dbResponseTime - 100) / 10);
      const uptimeScore = apiUptime;
      const errorScore = Math.max(0, 100 - errorRate * 50);
      const storageScore = Math.max(0, 100 - (storageUsed / storageMax) * 100);
      
      const healthScore = Math.round((dbScore + uptimeScore + errorScore + storageScore) / 4);

      const status: SystemHealth['status'] = 
        healthScore >= 90 ? 'healthy' :
        healthScore >= 70 ? 'warning' : 'critical';

      return {
        dbResponseTime: Math.round(dbResponseTime),
        apiUptime: Math.round(apiUptime * 100) / 100,
        storageUsed,
        storageMax,
        activeSessions,
        errorRate: Math.round(errorRate * 100) / 100,
        healthScore,
        status,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
