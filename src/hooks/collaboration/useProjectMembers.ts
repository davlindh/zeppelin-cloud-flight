import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePresence } from '@/hooks/usePresence';
import { useToast } from '@/hooks/use-toast';
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

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ invitation_id, project_id }: { invitation_id: string; project_id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update invitation status
      const { data: invitation, error } = await supabase
        .from('collaboration_project_members')
        .update({ 
          invitation_status: 'accepted',
          joined_at: new Date().toISOString()
        })
        .eq('id', invitation_id)
        .eq('user_id', user.id)
        .select('*, invited_by')
        .single();

      if (error) throw error;

      // Award points to joiner
      try {
        await supabase.rpc('apply_fave_transaction', {
          p_user_id: user.id,
          p_delta: 10,
          p_reason: 'project_joined',
          p_context_type: 'collaboration_project',
          p_context_id: project_id,
          p_domain: 'collaboration',
          p_metadata: { invitation_id }
        });

        // Award points to inviter
        if (invitation.invited_by) {
          await supabase.rpc('apply_fave_transaction', {
            p_user_id: invitation.invited_by,
            p_delta: 5,
            p_reason: 'successful_invitation',
            p_context_type: 'collaboration_project',
            p_context_id: project_id,
            p_domain: 'organizing',
            p_metadata: { invited_user: user.id }
          });
        }
      } catch (error) {
        console.error('Failed to award Fave Points:', error);
      }

      return invitation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['collaboration-project-members', variables.project_id] 
      });
      toast({ 
        title: 'Welcome!', 
        description: 'You joined the project! +10 Fave Points' 
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
};
