import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const storedEmail = localStorage.getItem('zeppel_admin_email');
    if (storedEmail) {
      verifyAdmin(storedEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyAdmin = async (email: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .single();

      if (data && !error) {
        setIsAdmin(true);
        setAdminEmail(email);
        localStorage.setItem('zeppel_admin_email', email);
      } else {
        setIsAdmin(false);
        setAdminEmail(null);
        localStorage.removeItem('zeppel_admin_email');
      }
    } catch (error) {
      console.error('Error verifying admin:', error);
      setIsAdmin(false);
      setAdminEmail(null);
      localStorage.removeItem('zeppel_admin_email');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Check if email exists in admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .single();

      if (error || !data) {
        return { success: false, error: 'Email not authorized for admin access' };
      }

      setIsAdmin(true);
      setAdminEmail(email);
      localStorage.setItem('zeppel_admin_email', email);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminEmail(null);
    localStorage.removeItem('zeppel_admin_email');
  };

  return (
    <AdminAuthContext.Provider value={{
      isAdmin,
      adminEmail,
      login,
      logout,
      loading
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};