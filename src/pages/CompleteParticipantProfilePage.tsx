import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useVerifyParticipantToken, useCompleteParticipantProfile } from '@/hooks/useParticipantToken';
import { supabase } from '@/integrations/supabase/client';
import { ParticipantProfileForm } from '@/components/participants/ParticipantProfileForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const CompleteParticipantProfilePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { data: tokenData, isLoading: isVerifying, error: verifyError } = useVerifyParticipantToken(token);
  const completeProfile = useCompleteParticipantProfile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsCheckingAuth(false);
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (data: any) => {
    if (!token) return;

    const result = await completeProfile.mutateAsync({
      token,
      ...data,
    });

    if (result.success && result.participant_slug) {
      navigate(`/participants/${result.participant_slug}`);
    }
  };

  if (isVerifying || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm text-muted-foreground">Verifierar länk...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenData?.valid || verifyError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Ogiltig länk</CardTitle>
            </div>
            <CardDescription>
              Denna länk är antingen ogiltig, har gått ut eller redan har använts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Om du behöver en ny länk, vänligen kontakta oss på{' '}
              <a href="mailto:admin@zeppelinn.se" className="text-purple-600 hover:underline">
                admin@zeppelinn.se
              </a>
            </p>
            <Button asChild className="w-full">
              <Link to="/">Tillbaka till startsidan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <CardTitle>Inloggning krävs</CardTitle>
            </div>
            <CardDescription>
              Du måste vara inloggad för att slutföra din profil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hej {tokenData.participant_name}!</AlertTitle>
              <AlertDescription>
                Registrerat email: <strong>{tokenData.participant_email}</strong>
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Logga in med din email eller skapa ett nytt konto för att fortsätta.
            </p>
            <Button asChild className="w-full">
              <Link to={`/auth?redirect=/participant/complete-profile?token=${token}`}>
                Logga in / Registrera
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>Slutför din deltagarprofil</CardTitle>
            </div>
            <CardDescription>
              Hej {tokenData.participant_name}! Fyll i uppgifterna nedan för att slutföra din profil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParticipantProfileForm
              onSubmit={handleSubmit}
              isSubmitting={completeProfile.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
