import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    isParticipant: roles?.includes('participant') || false,
    isCustomer: roles?.includes('customer') || false,
    roles: roles || [],
    isLoading
  };
};
