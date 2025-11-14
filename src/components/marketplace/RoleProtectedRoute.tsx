import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'provider' | 'customer' | 'participant';
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/',
  showUnauthorized = true,
}) => {
  const { data: user, isLoading: userLoading } = useAuthenticatedUser();
  const { roles, isLoading: rolesLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoading = userLoading || rolesLoading;
  const hasRequiredRole = roles.includes(requiredRole);
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate(`/auth?redirect=${location.pathname}`);
    }
    
    if (!isLoading && user && !hasRequiredRole && !showUnauthorized) {
      navigate(fallbackPath);
    }
  }, [isLoading, user, hasRequiredRole, navigate, location, fallbackPath, showUnauthorized]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) return null;
  
  if (!hasRequiredRole) {
    if (!showUnauthorized) return null;
    
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Card className="border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to access this page. This area is for {requiredRole}s only.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {requiredRole === 'provider' && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Want to become a service provider?
                </p>
                <Button asChild>
                  <Link to="/marketplace/provider/onboarding">
                    Apply to Become a Provider
                  </Link>
                </Button>
              </div>
            )}
            
            <Button variant="outline" onClick={() => navigate(fallbackPath)}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <>{children}</>;
};
