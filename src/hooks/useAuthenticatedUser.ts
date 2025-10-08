
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuthenticatedUserData {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
}

export const useAuthenticatedUser = () => {
  return useQuery({
    queryKey: ['authenticated-user'],
    queryFn: async (): Promise<AuthenticatedUserData | null> => {
      try {
        // Get the current auth user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          return null;
        }

        // Get additional user info from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name, phone')
          .eq('auth_user_id', user.id)
          .single();

        if (userError) {
          console.log('No additional user data found, using auth data only');
        }

        return {
          id: user.id,
          email: user.email || '',
          full_name: userData?.full_name || user.user_metadata?.full_name || '',
          phone: userData?.phone || user.user_metadata?.phone || ''
        };
      } catch (error) {
        console.error('Failed to fetch authenticated user:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};
