import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const bidFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Please enter your full name'),
  amount: z.number().min(1, 'Please enter a valid bid amount')
});

type BidFormValues = z.infer<typeof bidFormSchema>;

interface StandardizedBidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: string;
  currentBid: number;
  onBidSubmit: (bidData: { email: string; name: string; amount: number }) => Promise<void>;
  isSubmitting: boolean;
  endTime?: Date;
}

export const StandardizedBidDialog: React.FC<StandardizedBidDialogProps> = ({
  isOpen,
  onClose,
  auctionId: _auctionId,
  currentBid,
  onBidSubmit,
  isSubmitting = false,
  endTime
}) => {
  const minimumBid = currentBid + 50;
  const timeLeft = endTime ? endTime.getTime() - new Date().getTime() : 0;
  const isAuctionEnded = timeLeft <= 0;

  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidFormSchema.refine(
      (data) => data.amount >= minimumBid,
      {
        message: `Bid must be at least $${minimumBid.toLocaleString()}`,
        path: ['amount']
      }
    ).refine(
      (data) => data.amount <= currentBid * 10,
      {
        message: 'Bid amount seems unusually high. Please verify the amount.',
        path: ['amount']
      }
    )),
    defaultValues: {
      email: '',
      name: '',
      amount: minimumBid
    }
  });

  // Load saved email from localStorage
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('lastBidEmail');
    if (savedEmail) {
      form.setValue('email', savedEmail);
    }
  }, [form]);

  const onSubmit = async (data: BidFormValues) => {
    if (isAuctionEnded) {
      form.setError('root', { message: 'This auction has ended and no longer accepts bids' });
      return;
    }

    try {
      await onBidSubmit({
        email: data.email.trim(),
        name: data.name.trim(),
        amount: data.amount
      });
      
      // Save email for next time
      localStorage.setItem('lastBidEmail', data.email.trim());
      
      // Reset form on success
      form.reset();
      onClose();
    } catch (_error) {
      form.setError('root', { message: 'Failed to place bid. Please try again.' });
    }
  };

  const handleClose = () => {
    form.clearErrors();
    onClose();
  };

  const suggestedBids = [
    minimumBid,
    minimumBid + 100,
    minimumBid + 250,
    minimumBid + 500
  ].filter(amount => amount <= currentBid * 2);

  if (isAuctionEnded) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Auction Ended</DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <p className="text-muted-foreground">This auction has ended and no longer accepts bids.</p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Your Bid (minimum: ${minimumBid.toLocaleString()})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={minimumBid}
                      step="50"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  
                  {/* Quick bid suggestions */}
                  {suggestedBids.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      <span className="text-xs text-muted-foreground">Quick bids:</span>
                      {suggestedBids.map((amount) => (
                        <Badge
                          key={amount}
                          variant="secondary"
                          className="cursor-pointer hover-subtle transition-fast"
                          onClick={() => form.setValue('amount', amount)}
                        >
                          ${amount.toLocaleString()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
              </Alert>
            )}

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Current highest bid:</strong> ${currentBid.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
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
                className="flex-1"
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
        </Form>
      </DialogContent>
    </Dialog>
  );
};
