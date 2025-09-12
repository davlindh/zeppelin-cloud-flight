import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AdminLoginPage = () => {
  const { isAdmin, login, signup, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

  // Handle redirect when admin status changes
  useEffect(() => {
    if (isAdmin && !loading) {
      console.log('AdminLoginPage: Redirecting to /admin');
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = isSignupMode 
      ? await signup(email, password)
      : await login(email, password);
    
    if (!result.success) {
      setError(result.error || (isSignupMode ? 'Signup failed' : 'Login failed'));
    } else if (isSignupMode) {
      setError('');
      // Switch to login mode after successful signup
      setIsSignupMode(false);
      setPassword('');
      // Show success message
      setError('Registration successful! Please check your email and then log in.');
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Zeppel Inn Admin</CardTitle>
          <CardDescription>
            {isSignupMode 
              ? 'Register with your authorized email to create an admin account'
              : 'Enter your authorized email to access the admin dashboard'
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant={error.includes('successful') ? 'default' : 'destructive'}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="lindhdavid2@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignupMode ? "Create a password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-3">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !email.trim() || !password.trim()}
            >
              {isSubmitting 
                ? (isSignupMode ? 'Registering...' : 'Signing In...') 
                : (isSignupMode ? 'Register Admin Account' : 'Sign In to Admin Dashboard')
              }
            </Button>
            <Button 
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignupMode(!isSignupMode);
                setError('');
                setPassword('');
              }}
              disabled={isSubmitting}
            >
              {isSignupMode ? 'Already have an account? Sign In' : 'Need to register? Create Account'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};