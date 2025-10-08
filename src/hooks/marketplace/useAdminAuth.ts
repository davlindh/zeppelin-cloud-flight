import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

export const useAdminAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const checkAdminStatus = async (uid: string) => {
      try {
        console.log('[Admin Auth] Checking admin status for user:', uid);
        const { data: isAdminUser, error: adminCheckError } = await supabase
          .rpc('has_role', { _user_id: uid, _role: 'admin' });

        if (!isMounted) return;

        if (adminCheckError) {
          console.error('[Admin Auth] Admin check error:', adminCheckError);
          setIsAdmin(false);
          setAdminError('Admin verification failed. Please try again.');
        } else {
          setIsAdmin(!!isAdminUser);
          setAdminError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('[Admin Auth] Unexpected error during admin check:', err);
        setIsAdmin(false);
        setAdminError('Unexpected error during admin check.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Admin Auth] Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setIsLoading(true);
        const sUser = session?.user;
        if (sUser) {
          setUser({
            id: sUser.id,
            email: sUser.email!,
            full_name: sUser.user_metadata?.full_name,
            role: undefined
          });
          setAdminError(null);
          // Defer Supabase calls to avoid deadlocks in the auth callback
          setTimeout(() => checkAdminStatus(sUser.id), 0);
        } else {
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setAdminError(null);
        setIsLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error('[Admin Auth] Session error:', error);
        setUser(null);
        setIsAdmin(false);
        setAdminError('Failed to get session.');
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        const sUser = session.user;
        setUser({
          id: sUser.id,
          email: sUser.email!,
          full_name: sUser.user_metadata?.full_name,
          role: undefined
        });
        setAdminError(null);
        setIsLoading(true);
        checkAdminStatus(sUser.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Log security event before signing out
      if (user) {
        await supabase.from('admin_access_logs').insert({
          user_id: user.id,
          action: 'admin_logout',
          user_agent: navigator.userAgent,
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    isAdmin,
    isLoading,
    adminError,
    signOut,
  };
};