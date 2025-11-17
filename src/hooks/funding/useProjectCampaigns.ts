import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FundingCampaign } from '@/types/funding';

export const useProjectCampaigns = (projectId: string | undefined) => {
  return useQuery<FundingCampaign[]>({
    queryKey: ['project-campaigns', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('funding_campaigns')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FundingCampaign[];
    },
    staleTime: 30_000,
  });
};
