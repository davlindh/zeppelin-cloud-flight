import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AdminAuthContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
      const { data, error } = await supabase
        .from('admin_users')
        .select('email, auth_user_id')
        .or(`auth_user_id.eq.${userId},email.eq.${email}`)
        .single();

      return !error && data !== null;
    } catch (error) {
      console.error('Error verifying admin:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // First check if email is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .single();

      if (adminError || !adminData) {
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

      // Update admin_users with auth_user_id if not already set
      if (data.user) {
        await supabase
          .from('admin_users')
          .update({ auth_user_id: data.user.id })
          .eq('email', email)
          .is('auth_user_id', null);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
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
      logout,
      loading
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};