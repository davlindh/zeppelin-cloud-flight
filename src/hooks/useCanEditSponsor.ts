import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCanEditSponsor = (sponsorId?: string) => {
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: canEdit, isLoading } = useQuery({
    queryKey: ['can-edit-sponsor', sponsorId, session?.user?.id],
    queryFn: async () => {
      if (!sponsorId || !session?.user) return false;
      
      const { data, error } = await supabase
        .rpc('can_edit_sponsor', { _sponsor_id: sponsorId });
      
      if (error) {
        console.error('Error checking edit permission:', error);
        return false;
      }
      
      return data || false;
    },
    enabled: !!sponsorId && !!session?.user
  });

  return {
    canEdit: canEdit || false,
    isLoading
  };
};
