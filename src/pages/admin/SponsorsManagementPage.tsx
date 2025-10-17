import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SponsorManagementList } from '@/components/admin/SponsorManagementList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';

export const SponsorsManagementPage = () => {
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddSponsor = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleSuccess = async () => {
    setIsAddDialogOpen(false);
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

      <SponsorManagementList />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lägg till ny sponsor</DialogTitle>
          </DialogHeader>
          <AdminFormFactory
            entityType="sponsor"
            onClose={handleCloseDialog}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
