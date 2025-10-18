import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCanEditProject = (projectId?: string) => {
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: canEdit, isLoading } = useQuery({
    queryKey: ['can-edit-project', projectId, session?.user?.id],
    queryFn: async () => {
      if (!projectId || !session?.user) return false;
      
      const { data, error } = await supabase
        .rpc('can_edit_project', { _project_id: projectId });
      
      if (error) {
        console.error('Error checking edit permission:', error);
        return false;
      }
      
      return data || false;
    },
    enabled: !!projectId && !!session?.user
  });

  return {
    canEdit: canEdit || false,
    isLoading
  };
};
