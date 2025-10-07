
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BidHistorySectionProps {
  auctionId: string;
  currentBid: number;
  bidHistory?: Array<{ bidder: string; amount: number; time: string }>;
}

export const BidHistorySection: React.FC<BidHistorySectionProps> = ({
  auctionId: _auctionId,
  currentBid,
  bidHistory = []
}) => {
  const isCurrentUserEmail = (bidderInfo: string) => {
    const userEmail = localStorage.getItem('lastBidEmail');
    if (!userEmail) return false;
    
    // Extract email from bidder string format: "Name (ema****)"
    const emailMatch = bidderInfo.match(/\(([^)]+)\)/);
    if (!emailMatch?.[1]) return false;
    
    const maskedEmail = emailMatch[1];
    const userPrefix = userEmail.substring(0, 3);
    return maskedEmail.startsWith(userPrefix);
  };

  // Sort bids by time (most recent first), then by amount (highest first)
  // This ensures the most recent bid appears at the top
  const sortedBids = [...bidHistory].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    
    // Primary sort: most recent first
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    
    // Secondary sort: highest amount first (for same timestamp)
    return b.amount - a.amount;
  });

  // Find the highest bid amount to mark as winning
  const highestBidAmount = sortedBids.length > 0 ? Math.max(...sortedBids.map(bid => bid.amount)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bid History</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedBids.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No bids yet. Be the first to bid!</p>
        ) : (
          <div className="space-y-3">
            {sortedBids.map((bid, index) => {
              const isWinningBid = bid.amount === highestBidAmount && bid.amount === currentBid;
              const isMostRecent = index === 0;
              
              return (
                <div key={`${bid.bidder}-${bid.amount}-${bid.time}`} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bid.bidder}</span>
                    <span className="text-sm text-slate-600">
                      {new Date(bid.time).toLocaleString()}
                    </span>
                    {isWinningBid && (
                      <Badge variant="default" className="text-xs bg-green-600">Winning</Badge>
                    )}
                    {isMostRecent && !isWinningBid && (
                      <Badge variant="secondary" className="text-xs">Latest</Badge>
                    )}
                    {isCurrentUserEmail(bid.bidder) && (
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">Your Bid</Badge>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-blue-600">
                    ${bid.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
