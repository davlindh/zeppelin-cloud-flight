
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { SecurityNotice } from '@/components/marketplace/security/SecurityNotice';

interface GuestBidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: number;
  currentBid: number;
  onBidSubmit: (bid: { email: string; name: string; amount: number }) => void;
  isSubmitting?: boolean;
}

export const GuestBidDialog: React.FC<GuestBidDialogProps> = ({
  isOpen,
  onClose,
  auctionId: _auctionId,
  currentBid,
  onBidSubmit,
  isSubmitting = false
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const minBid = currentBid + 100;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    const amount = parseFloat(bidAmount);
    if (!bidAmount || isNaN(amount)) {
      newErrors.bidAmount = 'Please enter a valid bid amount';
    } else if (amount < minBid) {
      newErrors.bidAmount = `Minimum bid is $${minBid.toLocaleString()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onBidSubmit({
      email: email.trim(),
      name: name.trim(),
      amount: parseFloat(bidAmount)
    });

    // Reset form
    setEmail('');
    setName('');
    setBidAmount('');
    setErrors({});
  };

  const handleClose = () => {
    setEmail('');
    setName('');
    setBidAmount('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>
            Enter your details to place a bid. Your information is used for bid tracking only.
          </DialogDescription>
        </DialogHeader>
        
        <SecurityNotice type="bidding" className="mb-4" />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bidAmount">Bid Amount</Label>
            <Input
              id="bidAmount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Minimum: $${minBid.toLocaleString()}`}
              min={minBid}
              step="100"
              className={errors.bidAmount ? 'border-red-500' : ''}
            />
            {errors.bidAmount && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.bidAmount}
              </p>
            )}
            <p className="text-sm text-slate-600">
              Current bid: ${currentBid.toLocaleString()}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
