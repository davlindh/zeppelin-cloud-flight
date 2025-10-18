import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ClaimProfileBannerProps {
  participantId: string;
  participantName: string;
  userEmail: string;
  onClaimSuccess?: () => void;
}

export const ClaimProfileBanner: React.FC<ClaimProfileBannerProps> = ({
  participantId,
  participantName,
  userEmail,
  onClaimSuccess
}) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Ej inloggad',
          description: 'Du måste vara inloggad för att göra anspråk på en profil.'
        });
        return;
      }

      const { data, error } = await supabase.rpc('claim_participant_profile', {
        _participant_id: participantId,
        _user_id: user.id,
        _user_email: userEmail
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };

      if (result.success) {
        toast({
          title: 'Profil länkad!',
          description: result.message
        });
        
        if (onClaimSuccess) {
          onClaimSuccess();
        } else {
          // Reload page to show edit form
          window.location.reload();
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Kunde inte länka profil',
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error claiming profile:', error);
      toast({
        variant: 'destructive',
        title: 'Fel',
        description: 'Ett oväntat fel uppstod. Försök igen.'
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Alert className="border-primary bg-primary/5">
      <UserCheck className="h-4 w-4" />
      <AlertTitle>Är detta din profil?</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          Vi hittade en deltagarprofil för <strong>{participantName}</strong> som matchar din e-postadress ({userEmail}).
        </p>
        <p className="text-sm text-muted-foreground">
          Genom att göra anspråk på denna profil får du möjlighet att redigera och uppdatera din information själv.
        </p>
        <Button
          onClick={handleClaim}
          disabled={isClaiming}
          className="mt-2"
        >
          {isClaiming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Länkar profil...
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Gör anspråk på profil
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
