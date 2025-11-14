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
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency';

// Schema will be created with translations in component
const createBidFormSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t('auctions.enterValidEmail')),
  name: z.string().min(2, t('auctions.enterFullName')),
  amount: z.number().min(1, t('auctions.enterValidBid'))
});

type BidFormValues = {
  email: string;
  name: string;
  amount: number;
};

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
  const { t } = useTranslation();
  const minimumBid = currentBid + 50;
  const timeLeft = endTime ? endTime.getTime() - new Date().getTime() : 0;
  const isAuctionEnded = timeLeft <= 0;

  const form = useForm<BidFormValues>({
    resolver: zodResolver(createBidFormSchema(t).refine(
      (data) => data.amount >= minimumBid,
      {
        message: t('auctions.bidTooLow', { amount: formatCurrency(minimumBid) }),
        path: ['amount']
      }
    ).refine(
      (data) => data.amount <= currentBid * 10,
      {
        message: t('auctions.bidTooHigh'),
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
      form.setError('root', { message: t('auctions.auctionEndedNoBids') });
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
      form.setError('root', { message: t('auctions.auctionEndedNoBids') });
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
            <DialogTitle>{t('auctions.auctionEnded')}</DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <p className="text-muted-foreground">{t('auctions.auctionEndedDescription')}</p>
            <Button onClick={handleClose} className="mt-4">
              {t('auctions.close')}
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
          <DialogTitle>{t('auctions.placeYourBid')}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.email')}</FormLabel>
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
                  <FormLabel>{t('common.name')}</FormLabel>
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
                    {t('auctions.yourBid')} ({t('auctions.minimumBid')}: {formatCurrency(minimumBid)})
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
                      <span className="text-xs text-muted-foreground">{t('auctions.suggestedBids')}:</span>
                      {suggestedBids.map((amount) => (
                        <Badge
                          key={amount}
                          variant="secondary"
                          className="cursor-pointer hover-subtle transition-fast"
                          onClick={() => form.setValue('amount', amount)}
                        >
                          {formatCurrency(amount)}
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
                <strong>{t('auctions.currentHighestBid')}</strong> {formatCurrency(currentBid)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('auctions.enterContactDetails')}
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
                {t('auctions.cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('auctions.placingBid')}
                  </>
                ) : (
                  t('auctions.placeBid')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
