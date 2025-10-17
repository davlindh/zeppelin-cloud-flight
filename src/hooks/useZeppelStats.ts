import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ZeppelStats {
  submissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  participants: {
    total: number;
    with_profiles: number;
    public: number;
  };
  projects: {
    total: number;
  };
  media: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  sponsors: {
    total: number;
  };
}

export function useZeppelStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['zeppel-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_zeppel_admin_stats');
      
      if (error) throw error;
      
      return data as unknown as ZeppelStats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    stats: stats || {
      submissions: { total: 0, pending: 0, approved: 0, rejected: 0 },
      participants: { total: 0, with_profiles: 0, public: 0 },
      projects: { total: 0 },
      media: { total: 0, pending: 0, approved: 0, rejected: 0 },
      sponsors: { total: 0 },
    },
    isLoading,
    error,
  };
}
