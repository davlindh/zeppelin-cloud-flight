
import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsConfig {
  itemId: string;
  itemType: 'auction' | 'product' | 'service';
  itemTitle: string;
  currentBid?: number;
  price?: number;
  onQuickView?: () => void;
  onQuickBook?: () => void; // New service-specific action
}

export const useQuickActions = (config: QuickActionsConfig) => {
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const isWatching = isInWishlist(config.itemId);

  const handleToggleWatch = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isWatching) {
      removeItem(config.itemId);
      toast({
        title: "Removed from saved items",
        description: `"${config.itemTitle}" has been removed from your saved items.`,
      });
    } else {
      // Map service type to product for wishlist compatibility
      const wishlistType = config.itemType === 'service' ? 'product' : config.itemType;
      addItem(config.itemId, wishlistType as 'auction' | 'product');
      
      const actionText = config.itemType === 'service' ? 'saved services' : 'saved items';
      toast({
        title: `Added to ${actionText}`,
        description: `"${config.itemTitle}" has been added to your ${actionText}.`,
      });
    }
  };

  const handleQuickView = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (config.onQuickView) {
      config.onQuickView();
    } else {
      toast({
        title: "Quick View",
        description: `Opening quick view for "${config.itemTitle}"`,
      });
    }
  };

  const handleQuickBook = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (config.onQuickBook) {
      config.onQuickBook();
    } else {
      toast({
        title: "Quick Booking",
        description: `Opening quick booking for "${config.itemTitle}"`,
      });
    }
  };

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsSharing(true);

    try {
      const baseUrl = window.location.origin;
      const itemUrl = `${baseUrl}/${config.itemType === 'auction' ? 'auctions' : config.itemType === 'product' ? 'shop' : 'services'}/${config.itemId}`;
      
      let shareText = `Check out "${config.itemTitle}" on EliteMarket!`;
      
      if (config.itemType === 'auction' && config.currentBid) {
        shareText += ` Current bid: $${config.currentBid.toLocaleString()}`;
      } else if ((config.itemType === 'product' || config.itemType === 'service') && config.price) {
        shareText += ` ${config.itemType === 'service' ? 'Starting at' : 'Price'}: $${config.price.toLocaleString()}`;
      }

      const shareData = {
        title: `${config.itemTitle} - EliteMarket`,
        text: shareText,
        url: itemUrl
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copied!",
          description: "Item details have been copied to your clipboard.",
        });
      }
    } catch (error) {
      // Fallback to clipboard
      try {
        const itemUrl = `${window.location.origin}/${config.itemType === 'auction' ? 'auctions' : config.itemType === 'product' ? 'shop' : 'services'}/${config.itemId}`;
        await navigator.clipboard.writeText(itemUrl);
        toast({
          title: "Link copied!",
          description: "Item URL has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy the item link.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return {
    isWatching,
    isSharing,
    handleToggleWatch,
    handleQuickView,
    handleQuickBook,
    handleShare
  };
};
