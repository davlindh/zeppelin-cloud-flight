import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClaimableParticipantResult {
  canClaim: boolean;
  isLoading: boolean;
  participantEmail: string | null;
}

export const useClaimableParticipant = (participantId?: string): ClaimableParticipantResult => {
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: claimData, isLoading } = useQuery({
    queryKey: ['claimable-participant', participantId, session?.user?.email],
    queryFn: async () => {
      if (!participantId || !session?.user?.email) {
        return { canClaim: false, participantEmail: null };
      }

      // Fetch participant details
      const { data: participant, error } = await supabase
        .from('participants')
        .select('contact_email, auth_user_id')
        .eq('id', participantId)
        .maybeSingle();

      if (error || !participant) {
        return { canClaim: false, participantEmail: null };
      }

      // User can claim if:
      // 1. Email matches
      // 2. Profile is not yet claimed (auth_user_id is null)
      const canClaim = 
        participant.contact_email === session.user.email &&
        participant.auth_user_id === null;

      return {
        canClaim,
        participantEmail: participant.contact_email
      };
    },
    enabled: !!participantId && !!session?.user?.email
  });

  return {
    canClaim: claimData?.canClaim || false,
    isLoading,
    participantEmail: claimData?.participantEmail || null
  };
};
