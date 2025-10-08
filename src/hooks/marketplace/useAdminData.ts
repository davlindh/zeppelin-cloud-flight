import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminActivity {
  id: string;
  user_id: string | null;
  action: string;
  ip_address: unknown; // inet type from database
  user_agent: string | null;
  timestamp: string | null;
  details?: Record<string, unknown>;
}

export interface SecurityMetrics {
  totalUsers: number;
  recentLogins: number;
  failedAttempts: number;
  activeRoles: number;
  communicationRequests: number;
  recentBids: number;
  adminActions: number;
}

export const useAdminActivity = () => {
  return useQuery({
    queryKey: ['admin-activity'],
    queryFn: async (): Promise<AdminActivity[]> => {
      console.log('📊 Fetching admin activity...');
      
      const { data, error } = await supabase
        .from('admin_access_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching admin activity:', error);
        throw error;
      }

      return (data || []).map(log => ({
        ...log,
        timestamp: log.created_at
      }));
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};

export const useSecurityMetrics = () => {
  return useQuery({
    queryKey: ['security-metrics'],
    queryFn: async (): Promise<SecurityMetrics> => {
      console.log('🔒 Fetching security metrics...');
      
      try {
        const [
          rolesRes,
          commRes,
          bidsRes,
          adminActionsRes
        ] = await Promise.all([
          supabase.from('user_roles').select('id', { count: 'exact' }),
          supabase.from('communication_requests').select('id', { count: 'exact' })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('bid_history').select('id', { count: 'exact' })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('admin_access_logs').select('id', { count: 'exact' })
            .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ]);

        return {
          totalUsers: 0, // Function not available
          recentLogins: 0,
          failedAttempts: 0,
          activeRoles: rolesRes.count || 0,
          communicationRequests: commRes.count || 0,
          recentBids: bidsRes.count || 0,
          adminActions: adminActionsRes.count || 0,
        };
      } catch (error) {
        console.error('Error fetching security metrics:', error);
        return {
          totalUsers: 0,
          recentLogins: 0,
          failedAttempts: 0,
          activeRoles: 0,
          communicationRequests: 0,
          recentBids: 0,
          adminActions: 0,
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

export const useRoleChangeAudit = () => {
  return useQuery({
    queryKey: ['role-change-audit'],
    queryFn: async () => {
      console.log('📋 Fetching role change audit...');
      
      // Table doesn't exist - return empty array
      return [];
    },
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
};