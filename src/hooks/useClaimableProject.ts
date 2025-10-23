import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClaimableProjectResult {
  canClaim: boolean;
  isLoading: boolean;
  projectEmail: string | null;
  confidence: number;
  matchCriteria: Record<string, boolean>;
}

export const useClaimableProject = (projectId?: string): ClaimableProjectResult => {
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: claimData, isLoading } = useQuery({
    queryKey: ['claimable-project', projectId, session?.user?.email],
    queryFn: async () => {
      if (!projectId || !session?.user?.email) {
        return {
          canClaim: false,
          projectEmail: null,
          confidence: 0,
          matchCriteria: {}
        };
      }

      // Fetch project details
      const { data: project, error } = await supabase
        .from('projects')
        .select('contact_email, auth_user_id, title, description, location')
        .eq('id', projectId)
        .maybeSingle();

      if (error || !project) {
        return {
          canClaim: false,
          projectEmail: null,
          confidence: 0,
          matchCriteria: {}
        };
      }

      // Calculate match confidence
      let confidence = 0;
      const matchCriteria: Record<string, boolean> = {};

      // Email match (highest confidence)
      if (project.contact_email === session.user.email) {
        confidence += 100;
        matchCriteria.email = true;
      }

      // Check if already claimed
      const isClaimed = project.auth_user_id !== null;

      return {
        canClaim: !isClaimed && confidence >= 50,
        projectEmail: project.contact_email,
        confidence,
        matchCriteria
      };
    },
    enabled: !!projectId && !!session?.user?.email
  });

  return {
    canClaim: claimData?.canClaim || false,
    isLoading,
    projectEmail: claimData?.projectEmail || null,
    confidence: claimData?.confidence || 0,
    matchCriteria: claimData?.matchCriteria || {}
  };
};
