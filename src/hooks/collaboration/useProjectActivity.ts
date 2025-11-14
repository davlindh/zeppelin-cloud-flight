import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/shared/useRealtimeSubscription';
import { CollaborationProjectActivity } from '@/types/collaboration';

export const useProjectActivity = (projectId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['collaboration-project-activity', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_project_activity')
        .select('*')
        .eq('project_id', projectId)
        .is('parent_activity_id', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch user data for activities
      const userIds = [...new Set((data || []).map(a => a.user_id).filter(Boolean))];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds);

      const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

      // Fetch replies for each activity
      const activitiesWithReplies = await Promise.all(
        (data || []).map(async (activity) => {
          const { data: replies } = await supabase
            .from('collaboration_project_activity')
            .select('*')
            .eq('parent_activity_id', activity.id)
            .order('created_at', { ascending: true });

          return {
            ...activity,
            user: activity.user_id ? usersMap.get(activity.user_id) : undefined,
            replies: (replies || []).map((r: any) => ({ 
              ...r, 
              user: r.user_id ? usersMap.get(r.user_id) : undefined 
            }))
          };
        })
      );

      return activitiesWithReplies as CollaborationProjectActivity[];
    },
    enabled: !!projectId
  });

  // Real-time subscription
  useRealtimeSubscription({
    table: 'collaboration_project_activity',
    filter: `project_id=eq.${projectId}`,
    onInsert: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-project-activity', projectId] });
    },
    enabled: !!projectId
  });

  return query;
};

export const useAddActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: {
      project_id: string;
      activity_type: string;
      content?: string;
      metadata?: Record<string, any>;
      parent_activity_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('collaboration_project_activity')
        .insert({
          ...activity,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['collaboration-project-activity', variables.project_id] 
      });
    }
  });
};
