import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/api/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import { LoginForm, SignupForm, ForgotPasswordForm, SocialAuthButtons, ResetPasswordForm } from '@/components/auth';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    authService.getSession().then(({ session }) => {
      if (session?.user) {
        navigate(redirect);
      }
    });
  }, [navigate, redirect]);

  useEffect(() => {
    // Check if we should show the password reset form
    if (searchParams.get('reset') === 'true') {
      setShowResetPassword(true);
    }
  }, [searchParams]);

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background dark:from-background dark:via-primary/5 dark:to-background p-4 relative overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px]" />
        </div>
        <Card className="w-full max-w-md relative z-10">
          <CardHeader>
            <CardTitle>Återställ lösenord</CardTitle>
            <CardDescription>
              Ange din email så skickar vi instruktioner för att återställa ditt lösenord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm
              onBack={() => setShowForgotPassword(false)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background dark:from-background dark:via-primary/5 dark:to-background p-4 relative overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <ResetPasswordForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background dark:from-background dark:via-primary/5 dark:to-background p-4 relative overflow-hidden z-0">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px]" />
      </div>
      <Card className="w-full max-w-md relative z-10">
        <CardHeader>
          <CardTitle>Välkommen till Zeppel Inn</CardTitle>
          <CardDescription>
            Logga in eller skapa ett nytt konto för att fortsätta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Logga in</TabsTrigger>
              <TabsTrigger value="signup">Registrera</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <LoginForm
                onForgotPassword={() => setShowForgotPassword(true)}
                redirectPath={redirect}
              />
              <SocialAuthButtons redirectPath={redirect} />
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm redirectPath={redirect} />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center justify-center text-xs text-muted-foreground">
            <Shield className="mr-1 h-3 w-3" />
            Dina uppgifter är säkra och krypterade
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
