import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Shield, Mail, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  participant_id: string;
  claimed_by_user_id: string;
  claim_method: string;
  admin_assisted: boolean;
  admin_user_id: string | null;
  claimed_at: string;
  notes: string | null;
}

interface ClaimAuditLogViewerProps {
  participantId?: string;
}

export const ClaimAuditLogViewer: React.FC<ClaimAuditLogViewerProps> = ({ participantId }) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open, participantId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('participant_claim_audit')
        .select('*')
        .order('claimed_at', { ascending: false });

      if (participantId) {
        query = query.eq('participant_id', participantId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email_match':
        return <Mail className="h-4 w-4" />;
      case 'admin_manual':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'email_match':
        return 'E-postmatchning';
      case 'admin_manual':
        return 'Manuell (Admin)';
      default:
        return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          {participantId ? 'Visa logg' : 'Claim-logg'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Claim-historik</DialogTitle>
          <DialogDescription>
            {participantId
              ? 'Historik för denna deltagares profilkopplingar'
              : 'Senaste profilkopplingar i systemet'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ingen historik hittades
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        {getMethodIcon(log.claim_method)}
                        {getMethodLabel(log.claim_method)}
                      </Badge>
                      {log.admin_assisted && (
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin-assisterad
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.claimed_at), 'PPp', { locale: sv })}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-muted-foreground">Användare ID:</span>{' '}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {log.claimed_by_user_id}
                      </code>
                    </div>
                    {log.admin_user_id && (
                      <div>
                        <span className="text-muted-foreground">Utförd av admin:</span>{' '}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {log.admin_user_id}
                        </code>
                      </div>
                    )}
                  </div>
                  
                  {log.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
