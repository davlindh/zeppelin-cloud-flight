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

      // Enforce public visibility rules: only show active/successful campaigns with public visibility
      // unless specific filters override this
      if (!filters?.status?.length) {
        query = query.in('status', ['active', 'successful']);
      } else {
        query = query.in('status', filters.status);
      }

      if (!filters?.visibility) {
        query = query.eq('visibility', 'public');
      } else {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters?.eventId) {
        query = query.eq('event_id', filters.eventId);
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
