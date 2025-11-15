import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCreateDonation } from '@/hooks/funding';
import { Heart, CreditCard } from 'lucide-react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';

interface DonationFormProps {
  campaignId: string;
  currency?: string;
}

interface DonationFormData {
  amount: number;
  donor_name: string;
  donor_email: string;
  message: string;
  is_anonymous: boolean;
}

export const DonationForm = ({ campaignId, currency = 'SEK' }: DonationFormProps) => {
  const { data: user } = useAuthenticatedUser();
  const { mutate: createDonation, isPending } = useCreateDonation();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DonationFormData>({
    defaultValues: {
      amount: 0,
      donor_name: '',
      donor_email: user?.email || '',
      message: '',
      is_anonymous: false,
    },
  });

  const quickAmounts = [100, 250, 500, 1000, 2500];

  const onSubmit = (data: DonationFormData) => {
    createDonation({
      campaign_id: campaignId,
      amount: data.amount,
      currency,
      donor_name: data.donor_name,
      donor_email: data.donor_email,
      message: data.message,
      is_anonymous: data.is_anonymous,
    });
  };

  return (
    <Card className="backdrop-blur-xl bg-card/40 border-2 border-primary/20 shadow-2xl rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
          <Heart className="h-5 w-5 text-primary" />
          Support this campaign
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Quick amounts */}
          <div>
            <Label>Select amount ({currency})</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setValue('amount', amount);
                  }}
                  className="h-12"
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <Label htmlFor="amount">Or enter custom amount *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 1, message: 'Minimum amount is 1' }
              })}
              onChange={(e) => {
                setSelectedAmount(null);
                register('amount').onChange(e);
              }}
            />
            {errors.amount && (
              <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Donor info (if not logged in) */}
          {!user && (
            <>
              <div>
                <Label htmlFor="donor_name">Name *</Label>
                <Input
                  id="donor_name"
                  {...register('donor_name', { required: 'Name is required' })}
                />
                {errors.donor_name && (
                  <p className="text-sm text-destructive mt-1">{errors.donor_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="donor_email">Email *</Label>
                <Input
                  id="donor_email"
                  type="email"
                  {...register('donor_email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.donor_email && (
                  <p className="text-sm text-destructive mt-1">{errors.donor_email.message}</p>
                )}
              </div>
            </>
          )}

          {/* Message */}
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Leave a message of support..."
              {...register('message')}
              rows={3}
            />
          </div>

          {/* Anonymous checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_anonymous"
              onCheckedChange={(checked) => setValue('is_anonymous', checked as boolean)}
            />
            <Label htmlFor="is_anonymous" className="cursor-pointer">
              Make my donation anonymous
            </Label>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/50 transition-all duration-300"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isPending ? 'Processing...' : `Donate ${watch('amount') || 0} ${currency}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
