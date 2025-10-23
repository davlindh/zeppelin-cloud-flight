
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ensureUserProfile } from '@/utils/profileUtils';

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
          .maybeSingle();

        // If profile doesn't exist, try to create it
        if (!userData && !userError) {
          try {
            await ensureUserProfile(user.id, user.email || '');
            console.log('Created missing user profile');
          } catch (profileError) {
            console.warn('Could not create user profile:', profileError);
          }
        }

        // If there's still an error after trying to create profile, log it
        if (userError) {
          console.warn('Error fetching user profile:', userError);
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
