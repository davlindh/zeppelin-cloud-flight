import { useAuctionMutations } from '@/hooks/useAuctionMutations';
import { useToast } from '@/hooks/use-toast';
import type { Auction } from '@/types/unified';

export const useAuctionActions = () => {
  const { createAuction, updateAuction, deleteAuction, error } = useAuctionMutations();
  const { toast } = useToast();

  const handleCreate = async (auctionData: any) => {
    try {
      const result = await createAuction({
        title: auctionData.title!,
        description: auctionData.description,
        starting_bid: auctionData.starting_bid!,
        end_time: auctionData.end_time!,
        category: auctionData.category!,
        condition: auctionData.condition || 'good',
        image: auctionData.image!,
        images: auctionData.images,
      });
      
      if (result) {
        toast({
          title: "Auction created",
          description: `"${result.title}" has been successfully created.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: error ?? "Failed to create auction. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Create auction error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdate = async (id: string, auctionData: any) => {
    try {
      const result = await updateAuction({
        id,
        title: auctionData.title,
        description: auctionData.description,
        starting_bid: auctionData.starting_bid,
        current_bid: auctionData.current_bid,
        end_time: auctionData.end_time,
        category: auctionData.category,
        condition: auctionData.condition,
        image: auctionData.image,
        images: auctionData.images,
      });
      
      if (result) {
        toast({
          title: "Auction updated",
          description: `"${result.title}" has been successfully updated.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: error ?? "Failed to update auction. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Update auction error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDelete = async (auction: Auction) => {
    if (confirm(`Are you sure you want to delete "${auction.title}"?`)) {
      const success = await deleteAuction(auction.id);
      
      if (success) {
        toast({
          title: "Auction deleted",
          description: `"${auction.title}" has been successfully deleted.`,
        });
      } else {
        toast({
          title: "Error",
          description: error ?? "Failed to delete auction. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleView = (auction: Auction) => {
    return auction;
  };

  return { handleCreate, handleUpdate, handleDelete, handleView };
};
