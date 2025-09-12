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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if authenticated user is admin
          const isUserAdmin = await verifyAdmin(session.user.id, session.user.email);
          setIsAdmin(isUserAdmin);
          setAdminEmail(isUserAdmin ? session.user.email : null);
        } else {
          setIsAdmin(false);
          setAdminEmail(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        verifyAdmin(session.user.id, session.user.email).then((isUserAdmin) => {
          setIsAdmin(isUserAdmin);
          setAdminEmail(isUserAdmin ? session.user.email : null);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const verifyAdmin = async (userId: string, email?: string | null): Promise<boolean> => {
    try {
      if (!email) return false;
      
      const { data: isAuthorized, error } = await supabase
        .rpc('is_admin_email', { email_to_check: email });

      return !error && isAuthorized === true;
    } catch (error) {
      console.error('Error verifying admin:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Check if email is authorized using secure function
      const { data: isAuthorized, error: authError } = await supabase
        .rpc('is_admin_email', { email_to_check: email });

      if (authError || !isAuthorized) {
        return { success: false, error: 'Email not authorized for admin access' };
      }

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
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
      
      // Check if email is authorized using secure function
      const { data: isAuthorized, error: authError } = await supabase
        .rpc('is_admin_email', { email_to_check: email });

      if (authError || !isAuthorized) {
        return { success: false, error: 'Email not authorized for admin access' };
      }

      // Sign up with Supabase Auth
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
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
      loading
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};