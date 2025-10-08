import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, isLoading, adminError } = useAdminAuth();
  const navigate = useNavigate();
  const [showExtendedLoading, setShowExtendedLoading] = useState(false);

  useEffect(() => {
    // Handle navigation based on auth state
    if (!isLoading && !adminError) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (!isAdmin) {
        navigate('/', { replace: true });
      }
    }
  }, [isLoading, user, isAdmin, adminError, navigate]);

  // Show extended loading message after 5 seconds
  useEffect(() => {
    if (!isLoading) {
      setShowExtendedLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowExtendedLoading(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {showExtendedLoading ? "Still checking credentials..." : "Verifying admin credentials..."}
            </p>
            {showExtendedLoading && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This is taking longer than usual. You can try refreshing or signing in again.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (adminError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert className="w-full" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {adminError}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
              Sign In Again
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/') }>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Authentication required. Redirecting to login...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You don't have admin privileges. Contact an administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
