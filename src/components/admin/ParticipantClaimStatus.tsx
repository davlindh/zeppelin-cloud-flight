import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserCheck, UserX, Link as LinkIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ParticipantClaimStatusProps {
  participantId: string;
  authUserId: string | null;
  contactEmail: string | null;
  onUpdate: () => void;
}

export const ParticipantClaimStatus: React.FC<ParticipantClaimStatusProps> = ({
  participantId,
  authUserId,
  contactEmail,
  onUpdate
}) => {
  const { toast } = useToast();
  const [isUnclaiming, setIsUnclaiming] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showUnclaimDialog, setShowUnclaimDialog] = useState(false);

  const handleUnclaim = async () => {
    setIsUnclaiming(true);
    try {
      const { error } = await supabase
        .from('participants')
        .update({ auth_user_id: null })
        .eq('id', participantId);

      if (error) throw error;

      toast({
        title: 'Profil olänkad',
        description: 'Deltagarprofilen har olänkats från användarkontot'
      });
      setShowUnclaimDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Unclaim error:', error);
      toast({
        variant: 'destructive',
        title: 'Fel',
        description: 'Kunde inte olänka profilen'
      });
    } finally {
      setIsUnclaiming(false);
    }
  };

  const handleManualLink = async () => {
    setIsLinking(true);
    try {
      // Find user by email
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('auth_user_id')
        .eq('email', linkEmail)
        .limit(1);

      if (userError) throw userError;
      if (!users || users.length === 0) {
        throw new Error('Ingen användare hittades med den e-postadressen');
      }

      const userId = users[0].auth_user_id;

      // Update participant
      const { error: updateError } = await supabase
        .from('participants')
        .update({ auth_user_id: userId })
        .eq('id', participantId);

      if (updateError) throw updateError;

      // Log in audit table
      await supabase
        .from('participant_claim_audit')
        .insert({
          participant_id: participantId,
          claimed_by_user_id: userId,
          claim_method: 'admin_manual',
          admin_assisted: true,
          admin_user_id: (await supabase.auth.getUser()).data.user?.id
        });

      toast({
        title: 'Profil länkad',
        description: `Profilen har länkats till användaren med e-post ${linkEmail}`
      });
      setShowLinkDialog(false);
      setLinkEmail('');
      onUpdate();
    } catch (error) {
      console.error('Manual link error:', error);
      toast({
        variant: 'destructive',
        title: 'Fel',
        description: error instanceof Error ? error.message : 'Kunde inte länka profilen'
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {authUserId ? (
        <>
          <Badge variant="default" className="gap-1">
            <UserCheck className="h-3 w-3" />
            Länkad
          </Badge>
          <Dialog open={showUnclaimDialog} onOpenChange={setShowUnclaimDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isUnclaiming}>
                {isUnclaiming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserX className="h-4 w-4" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Olänka profil</DialogTitle>
                <DialogDescription>
                  Är du säker på att du vill olänka denna profil från användarkontot?
                  Användaren kommer att kunna länka profilen igen om e-postadressen matchar.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={handleUnclaim}>
                  Olänka profil
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Badge variant="secondary" className="gap-1">
            <UserX className="h-3 w-3" />
            Olänkad
          </Badge>
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Länka profil manuellt</DialogTitle>
                <DialogDescription>
                  Ange e-postadressen till användaren som ska länkas till denna profil.
                  {contactEmail && (
                    <span className="block mt-2 text-sm">
                      Profilens e-post: <strong>{contactEmail}</strong>
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="link-email">Användarens e-postadress</Label>
                  <Input
                    id="link-email"
                    type="email"
                    placeholder="anvandare@exempel.se"
                    value={linkEmail}
                    onChange={(e) => setLinkEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Avbryt
                </Button>
                <Button onClick={handleManualLink} disabled={isLinking || !linkEmail}>
                  {isLinking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Länkar...
                    </>
                  ) : (
                    'Länka profil'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
