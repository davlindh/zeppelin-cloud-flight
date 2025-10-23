import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Key, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });

  useEffect(() => {
    // Check if we have the required access token from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Ogiltig återställningslänk",
          description: "Återställningslänken är ogiltig eller har gått ut. Begär en ny.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
    };

    checkSession();
  }, [navigate, toast]);

  // Get current user email for display
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || '');
    };

    getUserEmail();
  }, []);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      toast({
        title: "Lösenord för kort",
        description: "Lösenordet måste vara minst 6 tecken långt.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lösenorden matchar inte",
        description: "Lösenorden måste matcha varandra.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        toast({
          title: "Kunde inte uppdatera lösenord",
          description: "Ett fel uppstod när lösenordet skulle återställas.",
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);

      toast({
        title: "Lösenord återställt!",
        description: "Ditt lösenord har återställts framgångsrikt. Du kan nu logga in med ditt nya lösenord.",
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/auth');
      }, 3000);

    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte återställa lösenord. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-semibold text-green-700">Lösenord återställt!</h2>
              <p className="text-muted-foreground mt-2">
                Ditt lösenord har återställts framgångsrikt. Du kan nu logga in med ditt nya lösenord.
              </p>
            </div>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Gå till inloggning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Key className="h-5 w-5" />
          Återställ lösenord
        </CardTitle>
        <CardDescription>
          Ange ditt nya lösenord nedan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>
            Du återställer lösenordet för: <strong>{userEmail}</strong>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nytt lösenord</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.password ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('password')}
              >
                {showPasswords.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Minst 6 tecken långt
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Bekräfta nytt lösenord</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('confirmPassword')}
              >
                {showPasswords.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Återställer lösenord...
              </>
            ) : (
              'Återställ lösenord'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
