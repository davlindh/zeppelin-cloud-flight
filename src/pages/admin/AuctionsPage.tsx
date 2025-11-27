import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AuctionsTable from '@/components/admin/auctions/AuctionsTable';
import AuctionForm from '@/components/admin/auctions/AuctionForm';
import { AuctionDetailModal } from '@/components/admin/auctions/AuctionDetailModal';
import { useAuctionActions } from '@/hooks/admin/useAuctionActions';
import type { Auction } from '@/types/unified';

export const AuctionsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { handleCreate, handleUpdate, handleDelete, handleView } = useAuctionActions();

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

  const handleViewDetails = (auction: Auction) => {
    setSelectedAuction(auction);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedAuction(null);
  };

  const handleEndAuction = async (auction: Auction) => {
    // TODO: Implement ending auction functionality
    console.log('Ending auction:', auction.id);
  };

  const handleExtendAuction = async (auction: Auction) => {
    // TODO: Implement extending auction functionality
    console.log('Extending auction:', auction.id);
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
      
      <AuctionsTable
        onCreateAuction={handleCreateClick}
        onEditAuction={handleEdit}
        onViewAuction={handleViewDetails}
        onDeleteAuction={handleDelete}
      />

      <AuctionDetailModal
        isOpen={showDetails}
        onClose={handleCloseDetails}
        auction={selectedAuction}
        onEditAuction={handleEdit}
        onEndAuction={handleEndAuction}
        onExtendAuction={handleExtendAuction}
      />
    </div>
  );
};
