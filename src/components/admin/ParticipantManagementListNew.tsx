import React, { useState, useMemo } from 'react';
import { useAdminContext, useParticipants } from '@/contexts/AdminContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { AdminFormFactory } from './AdminFormFactory';
import { Plus, Search, Filter, Edit, Trash2, Eye, Users, Mail, MapPin } from 'lucide-react';
import { Participant } from '@/types/admin';

interface ParticipantManagementListProps {
  onAddParticipant: () => void;
  onEditParticipant: (id: string) => void;
  onViewParticipant: (slug: string) => void;
}

export const ParticipantManagementListNew: React.FC<ParticipantManagementListProps> = ({
  onAddParticipant,
  onEditParticipant,
  onViewParticipant,
}) => {
  const { permissions } = useAdminContext();
  const { participants, isLoading, error, deleteParticipant } = useParticipants();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null);

  // Filter participants based on search query
  const filteredParticipants = useMemo(() => {
    if (!searchQuery) return participants;

    return participants.filter(participant =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [participants, searchQuery]);

  const handleEdit = (participant: Participant) => {
    setSelectedParticipant(participant);
    onEditParticipant(participant.id);
  };

  const handleView = (participant: Participant) => {
    onViewParticipant(participant.slug);
  };

  const handleDelete = (participantId: string) => {
    setParticipantToDelete(participantId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (participantToDelete) {
      await deleteParticipant(participantToDelete);
      setShowDeleteConfirm(false);
      setParticipantToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading participants...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading participants: {error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Participant Form Modal */}
      {selectedParticipant && (
        <AdminFormFactory
          entityType="participant"
          entityId={selectedParticipant.id}
          initialData={selectedParticipant as unknown as Record<string, unknown>}
          onClose={() => setSelectedParticipant(null)}
          onSuccess={() => setSelectedParticipant(null)}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participant Management
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredParticipants.length} of {participants.length})
              </span>
            </CardTitle>
            {permissions.canCreateParticipant && (
              <Button onClick={onAddParticipant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Participant
              </Button>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No participants found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first participant.'}
              </p>
              {permissions.canCreateParticipant && (
                <Button onClick={onAddParticipant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Participant
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredParticipants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  onEdit={() => handleEdit(participant)}
                  onView={() => handleView(participant)}
                  onDelete={() => handleDelete(participant.id)}
                  permissions={permissions}
                />
              ))}
            </div>
          )}
        </CardContent>

        {filteredParticipants.length > 0 && (
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                Showing {filteredParticipants.length} of {participants.length} participants
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Simple Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Delete Participant</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Are you sure you want to delete this participant? This action cannot be undone.</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

// Participant Card Component
interface ParticipantCardProps {
  participant: Participant;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  permissions: {
    canEditParticipant: boolean;
    canDeleteParticipant: boolean;
  };
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onEdit,
  onView,
  onDelete,
  permissions,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{participant.name}</CardTitle>
              <p className="text-sm text-muted-foreground">@{participant.slug}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            {permissions.canEditParticipant && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {permissions.canDeleteParticipant && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {participant.bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {participant.bio}
          </p>
        )}

        <div className="space-y-2">
          {participant.website && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={participant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Website
              </a>
            </div>
          )}

          {participant.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{participant.location}</span>
            </div>
          )}

          {participant.skills && participant.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {participant.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
              {participant.skills.length > 3 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                  +{participant.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
