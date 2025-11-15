import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FundingCampaign } from '@/types/funding';

interface CampaignFilters {
  status?: string[];
  eventId?: string;
  visibility?: string;
  projectId?: string;
}

export const useCampaigns = (filters?: CampaignFilters) => {
  return useQuery<FundingCampaign[]>({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from('funding_campaigns')
        .select(`
          *,
          projects(id, title, slug),
          collaboration_projects(id, title, slug),
          events(id, title, slug)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.eventId) {
        query = query.eq('event_id', filters.eventId);
      }

      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FundingCampaign[];
    },
  });
};
