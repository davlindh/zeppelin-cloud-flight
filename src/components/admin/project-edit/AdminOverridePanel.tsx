import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, UserPlus, UserMinus, Link, Unlink, AlertTriangle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';

interface AdminOverridePanelProps {
  projectId: string;
  projectTitle: string;
  currentOwner?: string;
  onOwnershipChange?: () => void;
}

export const AdminOverridePanel: React.FC<AdminOverridePanelProps> = ({
  projectId,
  projectTitle,
  currentOwner,
  onOwnershipChange
}) => {
  const { toast } = useToast();
  const { data: currentUser } = useAuthenticatedUser();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState<string>('');

  const forceClaimProject = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Fel',
        description: 'Välj en användare att länka projektet till',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('claim_project_profile' as any, {
        _project_id: projectId,
        _user_id: selectedUserId,
        _user_email: selectedUserEmail
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };

      if (result.success) {
        toast({
          title: 'Projekt länkad',
          description: `Projektet har länkats till användaren`,
        });
        onOwnershipChange?.();
      } else {
        toast({
          title: 'Kunde inte länka projekt',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error force claiming project:', error);
      toast({
        title: 'Fel',
        description: 'Ett oväntat fel uppstod',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unclaimProject = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          auth_user_id: null,
          claimed_at: null,
          match_confidence: 0,
          match_criteria: null
        })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Länkning bruten',
        description: 'Projektet är nu ej länkat till någon användare',
      });
      onOwnershipChange?.();
    } catch (error) {
      console.error('Error unclaiming project:', error);
      toast({
        title: 'Fel',
        description: 'Kunde inte bryta länkning',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchUserByEmail = async () => {
    if (!searchEmail) return;

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('auth_user_id, email')
        .ilike('email', `%${searchEmail}%`)
        .limit(5);

      if (error) throw error;

      // For demo purposes, show first match
      if (users && users.length > 0) {
        setSelectedUserId(users[0].auth_user_id);
        setSelectedUserEmail(users[0].email);
        toast({
          title: 'Användare hittad',
          description: `Hittade användare: ${users[0].email}`,
        });
      } else {
        toast({
          title: 'Ingen användare hittad',
          description: 'Försök med en annan e-postadress',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast({
        title: 'Fel',
        description: 'Kunde inte söka användare',
        variant: 'destructive',
      });
    }
  };

  const bulkUpdateOwnership = async () => {
    // This would be implemented for bulk operations
    toast({
      title: 'Bulkoperation',
      description: 'Bulkuppdatering av ägarskap kommer snart',
    });
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Shield className="h-5 w-5" />
          Adminverktyg - Ägarskapshantering
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Dessa verktyg är endast tillgängliga för administratörer och loggas för säkerhet.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="user-search">Sök användare via e-post</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="user-search"
                placeholder="användare@exempel.se"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Button onClick={searchUserByEmail} variant="outline">
                Sök
              </Button>
            </div>
          </div>

          {selectedUserEmail && (
            <div className="p-3 bg-white rounded border">
              <p className="text-sm">
                <strong>Vald användare:</strong> {selectedUserEmail}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={forceClaimProject}
              disabled={isLoading || !selectedUserId}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Tvinga länkning
            </Button>

            <Button
              onClick={unclaimProject}
              disabled={isLoading || !currentOwner}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Unlink className="h-4 w-4" />
              Bryt länkning
            </Button>

            <Button
              onClick={bulkUpdateOwnership}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Bulkuppdatera
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
