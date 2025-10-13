import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AuctionsTable from '@/components/admin/auctions/AuctionsTable';
import AuctionForm from '@/components/admin/auctions/AuctionForm';
import { useAuctionActions } from '@/hooks/admin/useAuctionActions';
import type { Auction } from '@/types/unified';

export const AuctionsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { handleCreate, handleUpdate } = useAuctionActions();

  const handleCreateClick = () => {
    setEditingAuction(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEdit = (auction: Auction) => {
    setEditingAuction(auction);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleSave = async (auctionData: any) => {
    if (formMode === 'create') {
      const success = await handleCreate(auctionData);
      if (success) {
        setShowForm(false);
        setEditingAuction(null);
      }
    } else if (editingAuction) {
      const success = await handleUpdate(editingAuction.id, auctionData);
      if (success) {
        setShowForm(false);
        setEditingAuction(null);
      }
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingAuction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Auctions</h1>
          <p className="text-muted-foreground">Manage auction listings</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Auction
        </Button>
      </div>

      <AuctionForm
        isOpen={showForm}
        onClose={handleClose}
        onSave={handleSave}
        auction={editingAuction}
        mode={formMode}
      />
      
      <AuctionsTable />
    </div>
  );
};
