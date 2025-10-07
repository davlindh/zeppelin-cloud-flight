
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

interface EnhancedBidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: string;
  currentBid: number;
  onBidSubmit: (bidData: { email: string; name: string; amount: number }) => Promise<void>;
  isSubmitting: boolean;
  endTime?: Date;
}

export const EnhancedBidDialog: React.FC<EnhancedBidDialogProps> = ({
  isOpen,
  onClose,
  auctionId: _auctionId,
  currentBid,
  onBidSubmit,
  isSubmitting,
  endTime
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');

  // Load saved email from localStorage
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('lastBidEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const minimumBid = currentBid + 50; // Minimum increment of $50
  const timeLeft = endTime ? endTime.getTime() - new Date().getTime() : 0;
  const isAuctionEnded = timeLeft <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if auction has ended
    if (isAuctionEnded) {
      setError('This auction has ended and no longer accepts bids');
      return;
    }

    // Validation
    if (!email || !name || !bidAmount) {
      setError('Please fill in all fields');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minimumBid) {
      setError(`Bid must be at least $${minimumBid.toLocaleString()}`);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Additional validation for reasonable bid amounts
    if (amount > currentBid * 10) {
      setError('Bid amount seems unusually high. Please verify the amount.');
      return;
    }

    try {
      await onBidSubmit({
        email: email.trim(),
        name: name.trim(),
        amount
      });
      
      // Reset form on success
      setBidAmount('');
      setError('');
      onClose();
    } catch (error) {
      // Error handling is managed by the hook
      console.log('Bid submission failed:', error);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const suggestedBids = [
    minimumBid,
    minimumBid + 100,
    minimumBid + 250,
    minimumBid + 500
  ].filter(amount => amount <= currentBid * 2); // Cap suggestions at 2x current bid

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAuctionEnded ? 'Auction Ended' : 'Place Your Bid'}
          </DialogTitle>
          <DialogDescription>
            {isAuctionEnded ? 'This auction has ended and no more bids can be placed.' : 'Enter your contact details and bid amount to participate in this auction.'}
          </DialogDescription>
        </DialogHeader>
        
        {isAuctionEnded ? (
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <p className="text-slate-600">This auction has ended and no longer accepts bids.</p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bidAmount">
                Your Bid (minimum: ${minimumBid.toLocaleString()})
              </Label>
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={minimumBid.toString()}
                min={minimumBid}
                step="50"
                required
                disabled={isSubmitting}
              />
              
              {/* Quick bid suggestions */}
              {suggestedBids.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs text-slate-500">Quick bids:</span>
                  {suggestedBids.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setBidAmount(amount.toString())}
                      className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                      disabled={isSubmitting}
                    >
                      ${amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Current highest bid:</strong> ${currentBid.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                By placing a bid, you agree that this bid is binding and you will complete the purchase if you win.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Placing Bid...
                  </>
                ) : (
                  'Place Bid'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
