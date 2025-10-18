import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Edit, Trash2, ExternalLink, Globe } from 'lucide-react';
import { fetchParticipantsWithMedia, logError } from '@/utils/adminApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '@/types/admin';
import { ParticipantClaimStatus } from './ParticipantClaimStatus';
import { ClaimAuditLogViewer } from './ClaimAuditLogViewer';

interface ParticipantManagementListProps {
  onAddParticipant: () => void;
  onEditParticipant: (slug: string) => void;
  onViewParticipant: (slug: string) => void;
}

export const ParticipantManagementList = ({
  onAddParticipant,
  onEditParticipant,
  onViewParticipant
}: ParticipantManagementListProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const data = await fetchParticipantsWithMedia();
      setParticipants(data as Participant[]);
    } catch (err) {
      logError('loadParticipants', err);
      setError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const deleteParticipant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setParticipants(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Participant deleted',
        description: 'The participant has been removed successfully.'
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast({
        title: 'Error deleting participant',
        description: e.message || 'Failed to delete participant',
        variant: 'destructive'
      });
    }
  };

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (participant.bio && participant.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Participant Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading participants...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Participant Management</CardTitle>
        <div className="flex gap-2">
          <ClaimAuditLogViewer />
          <Button onClick={onAddParticipant}>
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {filteredParticipants.length === 0 ? (
          <p className="text-muted-foreground">No participants found.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={participant.avatar_path || undefined} />
                          <AvatarFallback>
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          {participant.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {participant.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {participant.slug}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ParticipantClaimStatus
                        participantId={participant.id}
                        authUserId={participant.auth_user_id}
                        contactEmail={participant.contact_email}
                        onUpdate={loadParticipants}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {participant.participant_media?.length || 0} items
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {participant.website && (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                        {participant.social_links.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {participant.social_links.length} social
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(participant.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditParticipant(participant.slug)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewParticipant(participant.slug)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteParticipant(participant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
