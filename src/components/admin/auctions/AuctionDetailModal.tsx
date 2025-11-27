import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye,
  Clock,
  DollarSign,
  Users,
  Package,
  Activity,
  StopCircle,
  Calendar,
  Tag,
  AlertCircle,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency';
import { getImageUrl } from '@/utils/imageUtils';
import type { Auction } from '@/types/unified';

interface AuctionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction | null;
  onEditAuction?: (auction: Auction) => void;
  onEndAuction?: (auction: Auction) => Promise<void>;
  onExtendAuction?: (auction: Auction) => Promise<void>;
}

export function AuctionDetailModal({
  isOpen,
  onClose,
  auction,
  onEditAuction,
  onEndAuction,
  onExtendAuction
}: AuctionDetailModalProps) {
  if (!auction) return null;

  const getAuctionStatus = (auction: Auction) => {
    const now = new Date();
    const endTime = new Date(auction.endTime);
    const isActive = endTime > now;
    const timeLeft = endTime.getTime() - now.getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);

    if (!isActive) return {
      status: 'ended',
      variant: 'secondary' as const,
      label: 'Ended',
      description: 'Auction has concluded'
    };
    if (hoursLeft <= 1) return {
      status: 'critical',
      variant: 'destructive' as const,
      label: 'Ending Soon',
      description: 'Less than 1 hour remaining'
    };
    if (hoursLeft <= 24) return {
      status: 'warning',
      variant: 'outline' as const,
      label: 'Ending Today',
      description: `${Math.floor(timeLeft / (1000 * 60 * 60))} hours remaining`
    };
    return {
      status: 'active',
      variant: 'default' as const,
      label: 'Active',
      description: `${Math.floor(timeLeft / (1000 * 60 * 60 * 24))} days remaining`
    };
  };

  const status = getAuctionStatus(auction);
  const auctionAge = format(new Date(auction.endTime), 'PPP p');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-5 w-5" />
            Auction Details: {auction.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {status.description}
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-1">
            {/* Hero Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Main Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(auction.image)}
                      alt={auction.title}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  </div>

                  {/* Auction Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{auction.title}</h2>
                      {auction.description && (
                        <p className="text-muted-foreground mt-2">
                          {auction.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">{auction.category}</span>
                        <Badge variant="outline">{auction.condition}</Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Ends: {auctionAge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Bidding Status */}
                  <div className="text-right space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      ${auction.currentBid?.toLocaleString() || auction.startingBid.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Starting: ${auction.startingBid.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {auction.bidders || 0} bidder{auction.bidders !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Auction Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Auction Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Bid</p>
                      <p className="text-xl font-semibold text-green-600">
                        ${auction.currentBid?.toLocaleString() || 'No bids'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reserve Price</p>
                      <p className="text-xl font-semibold">
                        ${(auction as any).reservePrice?.toLocaleString() || 'No reserve'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Starting Bid</p>
                      <p className="text-xl font-semibold">
                        ${auction.startingBid.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bid Increment</p>
                      <p className="text-xl font-semibold">
                        ${(auction as any).bidIncrement?.toLocaleString() || '5'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timing Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {format(new Date((auction as any).createdAt || new Date()), 'PPP p')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="font-medium">
                        {format(new Date((auction as any).startedAt || auction.endTime), 'PPP p')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ends</p>
                      <p className="font-medium">
                        {auctionAge}
                      </p>
                    </div>
                    {new Date(auction.endTime).getTime() > new Date().getTime() && (
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={status.variant} className="mt-1">
                          {status.label} - {status.description}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Auction Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {onEditAuction && (
                    <Button onClick={() => onEditAuction(auction)} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Auction
                    </Button>
                  )}

                  {onExtendAuction && new Date(auction.endTime).getTime() > new Date().getTime() && (
                    <Button onClick={() => onExtendAuction(auction)} variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Extend Time
                    </Button>
                  )}

                  {onEndAuction && new Date(auction.endTime).getTime() > new Date().getTime() && (
                    <Button
                      onClick={() => onEndAuction(auction)}
                      variant="destructive"
                      className="text-red-600 hover:text-red-700"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      End Auction Now
                    </Button>
                  )}

                  {new Date(auction.endTime).getTime() <= new Date().getTime() && (
                    <Badge variant="secondary" className="px-3 py-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Auction has ended
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                {(auction as any).images && (auction as any).images.length > 1 && (
                  <>
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Additional Images ({(auction as any).images.length})</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {(auction as any).images.slice(1).map((image: string, index: number) => (
                          <img
                            key={index}
                            src={getImageUrl(image)}
                            alt={`${auction.title} ${index + 2}`}
                            className="w-full h-16 rounded object-cover"
                          />
                        ))}
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Auction ID</p>
                    <p className="font-mono">{auction.id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Category</p>
                    <p className="capitalize">{auction.category}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Condition</p>
                    <Badge variant="outline" className="capitalize">{auction.condition}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
