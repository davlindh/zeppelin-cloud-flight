import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SponsorManagementList } from '@/components/admin/SponsorManagementList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const SponsorsManagementPage = () => {
  const navigate = useNavigate();

  const handleAddSponsor = () => {
    // TODO: Implement add sponsor dialog/modal
    console.log('Add sponsor');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sponsorer</h1>
          <p className="text-muted-foreground">
            Hantera partners och sponsorer för showcase-projekten
          </p>
        </div>
        <Button onClick={handleAddSponsor}>
          <Plus className="mr-2 h-4 w-4" />
          Lägg till sponsor
        </Button>
      </div>

      <SponsorManagementList
        onAddSponsor={handleAddSponsor}
      />
    </div>
  );
};
