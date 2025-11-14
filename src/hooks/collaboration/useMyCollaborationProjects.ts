import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CollaborationProjectWithDetails } from '@/types/collaboration';

export const useMyCollaborationProjects = (filters?: {
  event_id?: string;
  status?: string;
  is_archived?: boolean;
}) => {
  return useQuery({
    queryKey: ['my-collaboration-projects', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('collaboration_projects')
        .select(`
          *,
          collaboration_project_members!inner(role, invitation_status),
          events(id, title, slug)
        `)
        .eq('collaboration_project_members.user_id', user.id)
        .eq('collaboration_project_members.invitation_status', 'accepted');

      if (filters?.event_id) query = query.eq('event_id', filters.event_id);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.is_archived !== undefined) query = query.eq('is_archived', filters.is_archived);

      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch stats for each project
      const projectsWithStats = await Promise.all(
        (data || []).map(async (project: any) => {
          const { data: statsData } = await supabase.rpc('get_collaboration_project_stats', {
            p_project_id: project.id
          });
          
          return {
            ...project,
            stats: statsData,
            my_role: project.collaboration_project_members[0]?.role
          };
        })
      );
      
      return projectsWithStats as CollaborationProjectWithDetails[];
    }
  });
};
