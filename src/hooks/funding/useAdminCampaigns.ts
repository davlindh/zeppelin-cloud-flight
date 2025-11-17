import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FundingCampaign } from '@/types/funding';

interface AdminCampaignFilters {
  status?: string[];
  eventId?: string;
  visibility?: string;
  projectId?: string;
  collaborationProjectId?: string;
}

export const useAdminCampaigns = (filters?: AdminCampaignFilters) => {
  return useQuery<FundingCampaign[]>({
    queryKey: ['admin-campaigns', filters],
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

      // Apply filters only if explicitly provided
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters?.eventId) {
        query = query.eq('event_id', filters.eventId);
      }

      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
      }

      if (filters?.collaborationProjectId) {
        query = query.eq('collaboration_project_id', filters.collaborationProjectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FundingCampaign[];
    },
  });
};
