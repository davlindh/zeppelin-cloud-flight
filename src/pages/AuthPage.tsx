import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <ResetPasswordForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
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
