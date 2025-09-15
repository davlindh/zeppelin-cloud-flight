import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const AdminLoginPage = () => {
  const { isAdmin, login, signup, loading } = useAdminAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin && !loading) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const resetPassword = async () => {
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`
      });
      if (err) {
        // Hide whether email is registered
        if (err.message.includes('Invalid login credentials')) {
          setMessage('If your email is registered, you’ll receive reset instructions.');
        } else {
          setError(err.message);
        }
      } else {
        setMessage('Check your email for password reset instructions.');
      }
    } catch (e: unknown) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (password !== confirm) {
          setError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        const result = await signup(email, password);
        if (!result.success) {
          setError(result.error || 'Signup failed.');
        } else {
          setMessage('Registration successful! Check email to confirm.');
          setMode('login');
        }
      } else {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Login failed.');
        }
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Zeppel Inn Admin</CardTitle>
          <CardDescription>
            {mode === 'signup'
              ? 'Create an admin account'
              : mode === 'forgot'
              ? 'Reset your password'
              : 'Sign in to access admin dashboard'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(error || message) && (
              <Alert variant={error ? 'destructive' : 'default'} aria-live="assertive">
                <AlertDescription>
                  {error || message}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {mode === 'login' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-sm text-right">
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setMessage('');
                    }}
                    disabled={isSubmitting}
                  >
                    Forgot password?
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            {mode === 'forgot' && (
              <p className="text-sm text-gray-600">
                Enter your email and we’ll send instructions to reset your password.
              </p>
            )}
          </CardContent>

          <CardFooter className="flex-col space-y-3">
            {mode === 'forgot' ? (
              <Button
                type="button"
                className="w-full"
                onClick={resetPassword}
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting ||
                  !email.trim() ||
                  ((mode === 'login' || mode === 'signup') && !password.trim())
                }
              >
                {isSubmitting
                  ? mode === 'signup'
                    ? 'Registering...'
                    : 'Signing in...'
                  : mode === 'signup'
                  ? 'Register'
                  : 'Sign In'}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setMessage('');
                setPassword('');
                setConfirm('');
              }}
              disabled={isSubmitting}
            >
              {mode === 'login'
                ? 'Need to register?'
                : mode === 'signup'
                ? 'Back to sign in'
                : 'Back to login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
