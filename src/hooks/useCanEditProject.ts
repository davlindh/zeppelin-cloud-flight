import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export const useCanEditProject = (projectId?: string) => {
  const { isAdmin, isLoading: isLoadingRole } = useUserRole();

  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: projectOwner, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project-ownership', projectId],
    queryFn: async () => {
      if (!projectId || !session?.user) return null;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error) {
        console.error('Error checking project ownership:', error);
        return null;
      }

      return (data as any)?.auth_user_id || null;
    },
    enabled: !!projectId && !!session?.user
  });

  // Check via RPC function for comprehensive permission checking
  const { data: canEditViaRPC, isLoading: isLoadingRPC } = useQuery({
    queryKey: ['can-edit-project-rpc', projectId, session?.user?.id],
    queryFn: async () => {
      if (!projectId || !session?.user) return false;

      // Admins can always edit
      if (isAdmin) return true;

      // Check via RPC function for non-admins
      const { data, error } = await supabase
        .rpc('can_edit_project', { _project_id: projectId });

      if (error) {
        console.error('Error checking project edit permission:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!projectId && !!session?.user && !isLoadingRole
  });

  return {
    canEdit: isAdmin || (projectOwner === session?.user?.id) || canEditViaRPC || false,
    isOwner: projectOwner === session?.user?.id,
    isAdmin,
    isLoading: isLoadingRole || isLoadingProject || isLoadingRPC
  };
};
