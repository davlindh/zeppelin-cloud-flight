import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePresence } from '@/hooks/usePresence';
import { CollaborationProjectMember } from '@/types/collaboration';

export const useProjectMembers = (projectId: string) => {
  const { isUserOnline } = usePresence(`collaboration-project:${projectId}`);

  return useQuery({
    queryKey: ['collaboration-project-members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('invitation_status', 'accepted')
        .order('joined_at', { ascending: true });

      if (error) throw error;

      // Fetch user data
      const userIds = (data || []).map(m => m.user_id);
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', userIds);

      const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

      // Add online status
      return (data || []).map(member => ({
        ...member,
        user: usersMap.get(member.user_id),
        is_online: isUserOnline(member.user_id)
      })) as (CollaborationProjectMember & { is_online: boolean })[];
    },
    enabled: !!projectId
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      project_id: string;
      user_id: string;
      role: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: invitation, error } = await supabase
        .from('collaboration_project_members')
        .insert({
          ...data,
          invitation_status: 'pending',
          invited_by: user.id,
          invited_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return invitation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['collaboration-project-members', variables.project_id] 
      });
    }
  });
};
