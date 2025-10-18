import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export const useCanEditParticipant = (participantId?: string) => {
  const { isAdmin, isLoading: isLoadingRole } = useUserRole();
  
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: canEdit, isLoading: isLoadingRPC } = useQuery({
    queryKey: ['can-edit-participant', participantId, session?.user?.id],
    queryFn: async () => {
      if (!participantId || !session?.user) return false;
      
      // Admins can always edit
      if (isAdmin) return true;
      
      // Check via RPC function for non-admins
      const { data, error } = await supabase
        .rpc('can_edit_participant', { _participant_id: participantId });
      
      if (error) {
        console.error('Error checking edit permission:', error);
        return false;
      }
      
      return data || false;
    },
    enabled: !!participantId && !!session?.user && !isLoadingRole
  });

  return {
    canEdit: isAdmin || canEdit || false,
    isLoading: isLoadingRole || isLoadingRPC
  };
};
