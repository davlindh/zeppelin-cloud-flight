import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AdminAuthContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  ensureAdminAuth: () => Promise<boolean>; // Ensure admin auth session is active
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Set loading timeout as fallback
    const setLoadingTimeout = () => {
      timeoutId = setTimeout(() => {
        // console.log('AdminAuth: Loading timeout reached, setting loading to false');
        setLoading(false);
      }, 10000); // 10 second timeout
    };

    // Set up auth state listener - CRITICAL: No async callback to prevent deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // console.log('AdminAuth: Auth state changed', event, session?.user?.email);
        
        // Clear any existing timeout
        if (timeoutId) clearTimeout(timeoutId);
        
        // Update session state immediately
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer admin verification to avoid callback deadlock
          setTimeout(() => {
            verifyAdmin(session.user.id, session.user.email).then((isUserAdmin) => {
              console.log('AdminAuth: Admin verification result', isUserAdmin);
              setIsAdmin(isUserAdmin);
              setAdminEmail(isUserAdmin ? session.user.email : null);
              setLoading(false);
            }).catch((error) => {
              console.error('AdminAuth: Admin verification failed', error);
              setIsAdmin(false);
              setAdminEmail(null);
              setLoading(false);
            });
          }, 0);
        } else {
          setIsAdmin(false);
          setAdminEmail(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    setLoadingTimeout();
    supabase.auth.getSession().then(({ data: { session } }) => {
      // console.log('AdminAuth: Initial session check', session?.user?.email);
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (!session?.user) {
        // No session, stop loading immediately
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAdminEmail(null);
        setLoading(false);
      }
      // If there is a session, let the auth state change handler deal with it
    }).catch((error) => {
      console.error('AdminAuth: Session check failed', error);
      setLoading(false);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const verifyAdmin = async (userId: string, email?: string | null): Promise<boolean> => {
    try {
      if (!userId) return false;
      
      const { data: isAuthorized, error } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'admin' });

      return !error && isAuthorized === true;
    } catch (error) {
      console.error('Error verifying admin:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Sign in with Supabase Auth first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if user has admin role
      if (data.user) {
        const { data: isAuthorized, error: authError } = await supabase
          .rpc('has_role', { _user_id: data.user.id, _role: 'admin' });

        if (authError || !isAuthorized) {
          await supabase.auth.signOut();
          return { success: false, error: 'User does not have admin privileges' };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Note: Admin role must be assigned manually in the database by existing admins
      return { 
        success: true, 
        error: 'Account created. Please contact an administrator to grant admin privileges.'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const ensureAdminAuth = async (): Promise<boolean> => {
    try {
      if (!session?.user || !isAdmin) {
        return false;
      }

      // Ensure the admin session is active
      const { data, error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token!
      });

      if (error || !data.session) {
        console.error('Failed to ensure admin auth:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error ensuring admin auth:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setAdminEmail(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      isAdmin,
      adminEmail,
      user,
      session,
      login,
      signup,
      logout,
      loading,
      ensureAdminAuth
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
