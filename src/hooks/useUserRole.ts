import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/types/roles';

export const useUserRole = () => {
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);
      return data?.map(r => r.role) || [];
    },
    enabled: !!session?.user?.id
  });

  return {
    isAdmin: roles?.includes('admin') || false,
    isModerator: roles?.includes('moderator') || false,
    isParticipant: roles?.includes('participant') || false,
    isProvider: roles?.includes('provider') || false,
    isCustomer: roles?.includes('customer') || false,
    roles: (roles || []) as AppRole[],
    isLoading,
    
    // Helper functions
    hasRole: (role: AppRole) => roles?.includes(role) || false,
    hasAnyRole: (checkRoles: AppRole[]) => 
      checkRoles.some(r => roles?.includes(r)) || false,
    canAccessAdmin: roles?.some(r => ['admin', 'moderator'].includes(r)) || false,
  };
};
