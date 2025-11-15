import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectFormData } from '@/types/collaboration';
import { useToast } from '@/hooks/use-toast';

export const useCreateCollaborationProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate slug
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('collaboration_projects')
        .insert({
          ...data,
          slug,
          owner_id: user.id,
          created_by: user.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('collaboration_project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner',
          invitation_status: 'accepted'
        });

      if (memberError) throw memberError;

      // Log activity
      await supabase
        .from('collaboration_project_activity')
        .insert({
          project_id: project.id,
          user_id: user.id,
          activity_type: 'project_updated',
          content: 'Project created'
        });

      return project;
    },
    onSuccess: async (project) => {
      queryClient.invalidateQueries({ queryKey: ['my-collaboration-projects'] });
      
      // Award Fave Points for project creation
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.rpc('apply_fave_transaction', {
            p_user_id: user.id,
            p_delta: 50,
            p_reason: 'project_created',
            p_context_type: 'collaboration_project',
            p_context_id: project.id,
            p_domain: 'organizing',
            p_metadata: {
              project_title: project.title,
              event_id: project.event_id
            }
          });
        }
      } catch (error) {
        console.error('Failed to award Fave Points:', error);
      }
      
      toast({
        title: 'Success',
        description: 'Project created successfully! +50 Fave Points'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateCollaborationProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProjectFormData> & { id: string }) => {
      const { data: project, error } = await supabase
        .from('collaboration_projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-collaboration-projects'] });
      queryClient.invalidateQueries({ queryKey: ['collaboration-project', data.id] });
      toast({
        title: 'Success',
        description: 'Project updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
};
