import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCanEditParticipant = (participantId?: string) => {
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: canEdit, isLoading } = useQuery({
    queryKey: ['can-edit-participant', participantId, session?.user?.id],
    queryFn: async () => {
      if (!participantId || !session?.user) return false;
      
      // Check via RPC function
      const { data, error } = await supabase
        .rpc('can_edit_participant', { _participant_id: participantId });
      
      if (error) {
        console.error('Error checking edit permission:', error);
        return false;
      }
      
      return data || false;
    },
    enabled: !!participantId && !!session?.user
  });

  return {
    canEdit: canEdit || false,
    isLoading
  };
};
