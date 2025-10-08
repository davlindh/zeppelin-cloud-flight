import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface ParticipantTokenManagerProps {
  participantId: string;
}

export const ParticipantTokenManager: React.FC<ParticipantTokenManagerProps> = ({ participantId }) => {
  const { data: tokens, isLoading } = useQuery({
    queryKey: ['participant-tokens', participantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participant_tokens')
        .select('*')
        .eq('participant_id', participantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <div>Laddar tokens...</div>;

  const getTokenStatus = (token: any) => {
    if (token.used_at) {
      return { label: 'Använd', variant: 'default' as const, icon: CheckCircle };
    }
    if (new Date(token.expires_at) < new Date()) {
      return { label: 'Utgången', variant: 'destructive' as const, icon: XCircle };
    }
    return { label: 'Aktiv', variant: 'default' as const, icon: Clock };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token-historik</CardTitle>
        <CardDescription>
          Hantera profilslutsförande tokens för denna deltagare
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tokens?.length === 0 && (
          <p className="text-sm text-muted-foreground">Inga tokens har genererats ännu.</p>
        )}

        {tokens?.map((token) => {
          const status = getTokenStatus(token);
          const StatusIcon = status.icon;

          return (
            <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={status.variant}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Skapad: {format(new Date(token.created_at), 'PPP', { locale: sv })}
                  </span>
                </div>
                <p className="text-sm">
                  Går ut: {format(new Date(token.expires_at), 'PPP HH:mm', { locale: sv })}
                </p>
                {token.used_at && (
                  <p className="text-sm text-green-600">
                    Använd: {format(new Date(token.used_at), 'PPP HH:mm', { locale: sv })}
                  </p>
                )}
              </div>

              {!token.used_at && new Date(token.expires_at) > new Date() && (
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Skicka om
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
