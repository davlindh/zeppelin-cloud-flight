import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AppUser, AuthSession } from '@/api/auth';

interface AdminAuthContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  user: AppUser | null;
  session: AuthSession | null;
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

const verifyAdmin = async (userId: string, email?: string | null): Promise<boolean> => {
  try {
    if (!userId) return false;
    return await authService.hasRole(userId, 'admin');
  } catch (error) {
    console.error('Error verifying admin:', error);
    return false;
  }
};



interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Set loading timeout as fallback
    const setLoadingTimeout = () => {
      timeoutId = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10 second timeout
    };

    // Set up auth state listener
    const { unsubscribe } = authService.onAuthStateChange(
      (event, session) => {
        // Clear any existing timeout
        if (timeoutId) clearTimeout(timeoutId);

        // Update session state immediately
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer admin verification to avoid callback deadlock
          setTimeout(() => {
            verifyAdmin(session.user.id, session.user.email).then((isUserAdmin) => {
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
    authService.getSession().then(({ session }) => {

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
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const response = await authService.login(email, password);

      if (!response.success) {
        return { success: false, error: response.error };
      }

      // Check if user has admin role
      if (response.user) {
        const isAuthorized = await authService.hasRole(response.user.id, 'admin');

        if (!isAuthorized) {
          await authService.logout();
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

      const response = await authService.signup(email, password);

      if (!response.success) {
        return { success: false, error: response.error };
      }

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
      return true;
    } catch (error) {
      console.error('Error ensuring admin auth:', error);
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
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
