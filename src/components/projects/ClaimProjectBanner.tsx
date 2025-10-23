import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClaimProjectBannerProps {
  projectId: string;
  projectTitle: string;
  userEmail: string;
  confidence: number;
  matchCriteria: Record<string, boolean>;
  onClaimSuccess?: () => void;
}

export const ClaimProjectBanner: React.FC<ClaimProjectBannerProps> = ({
  projectId,
  projectTitle,
  userEmail,
  confidence,
  matchCriteria,
  onClaimSuccess
}) => {
  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Ej inloggad',
          description: 'Du måste vara inloggad för att göra anspråk på ett projekt.'
        });
        return;
      }

      const { data, error } = await supabase.rpc('claim_project_profile' as any, {
        _project_id: projectId,
        _user_id: user.id,
        _user_email: userEmail
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };

      if (result.success) {
        toast({
          title: 'Projekt länkad!',
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
          title: 'Kunde inte länka projekt',
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error claiming project:', error);
      toast({
        variant: 'destructive',
        title: 'Fel',
        description: 'Ett oväntat fel uppstod. Försök igen.'
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (confidence >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 90) return 'Hög matchning';
    if (confidence >= 70) return 'Medium matchning';
    if (confidence >= 50) return 'Låg matchning';
    return 'Möjlig matchning';
  };

  const getMatchCriteriaText = () => {
    const criteria = [];
    if (matchCriteria.email) criteria.push('E-post');
    if (matchCriteria.name) criteria.push('Namn');
    if (matchCriteria.phone) criteria.push('Telefon');
    if (matchCriteria.location) criteria.push('Plats');
    if (matchCriteria.skills) criteria.push('Färdigheter');
    return criteria.length > 0 ? criteria.join(', ') : 'Okända kriterier';
  };

  return (
    <Alert className="border-primary bg-primary/5">
      <Briefcase className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Är detta ditt projekt?
        <Badge className={getConfidenceColor(confidence)}>
          {confidence}% {getConfidenceText(confidence)}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          Vi hittade ett projekt <strong>"{projectTitle}"</strong> som matchar din information ({userEmail}).
        </p>

        {Object.keys(matchCriteria).length > 0 && (
          <div className="text-sm">
            <strong>Matchande kriterier:</strong> {getMatchCriteriaText()}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Genom att göra anspråk på detta projekt får du möjlighet att redigera och uppdatera projektinformationen själv.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleClaim}
            disabled={isClaiming}
            className="mt-2"
          >
            {isClaiming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Länkar projekt...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Gör anspråk på projekt
              </>
            )}
          </Button>

          {confidence < 70 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Could open a modal for manual verification
                toast({
                  title: 'Låg matchning',
                  description: 'Överväg att kontakta admin för att verifiera ägarskap.',
                  variant: 'default'
                });
              }}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Behöver verifiering
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
