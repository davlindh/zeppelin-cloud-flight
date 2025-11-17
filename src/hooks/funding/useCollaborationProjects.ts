import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CollaborationProject {
  id: string;
  title: string;
  slug: string;
  event_id: string;
  status: string;
  visibility: string;
}

interface UseCollaborationProjectsOptions {
  eventId?: string;
  status?: string;
}

export const useCollaborationProjects = (options?: UseCollaborationProjectsOptions) => {
  return useQuery<CollaborationProject[]>({
    queryKey: ['collaboration-projects', options],
    queryFn: async () => {
      let query = supabase
        .from('collaboration_projects')
        .select('id, title, slug, event_id, status, visibility')
        .order('created_at', { ascending: false });

      if (options?.eventId) {
        query = query.eq('event_id', options.eventId);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });
};
