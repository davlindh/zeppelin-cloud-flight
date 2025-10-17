import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticipantManagementList } from '@/components/admin/ParticipantManagementList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ParticipantsManagementPage = () => {
  const navigate = useNavigate();

  const handleAddParticipant = () => {
    // TODO: Implement add participant dialog/modal
    console.log('Add participant');
  };

  const handleEditParticipant = (slug: string) => {
    navigate(`/admin/participants/${slug}/edit`);
  };

  const handleViewParticipant = (slug: string) => {
    navigate(`/participants/${slug}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deltagare</h1>
          <p className="text-muted-foreground">
            Hantera deltagare i showcase-projekten
          </p>
        </div>
        <Button onClick={handleAddParticipant}>
          <Plus className="mr-2 h-4 w-4" />
          Lägg till deltagare
        </Button>
      </div>

      <ParticipantManagementList
        onAddParticipant={handleAddParticipant}
        onEditParticipant={handleEditParticipant}
        onViewParticipant={handleViewParticipant}
      />
    </div>
  );
};
