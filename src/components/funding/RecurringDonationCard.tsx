import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RefreshCcw, Calendar, DollarSign, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface RecurringDonationCardProps {
  subscription: {
    id: string;
    campaign_id: string;
    amount: number;
    currency: string;
    status: string;
    interval: string;
    current_period_end: string;
    created_at: string;
    funding_campaigns?: {
      title: string;
      slug: string;
    };
  };
  totalContributed: number;
}

export const RecurringDonationCard = ({ subscription, totalContributed }: RecurringDonationCardProps) => {
  const [isCanceling, setIsCanceling] = useState(false);
  const queryClient = useQueryClient();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'past_due':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscription_id: subscription.id },
      });

      if (error) throw error;

      toast.success(data.message || 'Subscription canceled successfully');
      queryClient.invalidateQueries({ queryKey: ['user-donations'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {subscription.funding_campaigns?.title || 'Campaign'}
            </CardTitle>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Monthly contribution:</span>
            </div>
            <span className="text-lg font-bold">
              {subscription.amount.toLocaleString('sv-SE')} {subscription.currency}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Next payment:</span>
            </div>
            <span className="text-sm font-medium">
              {format(parseISO(subscription.current_period_end), 'MMM dd, yyyy')}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Total contributed:</span>
            <span className="text-sm font-semibold">
              {totalContributed.toLocaleString('sv-SE')} {subscription.currency}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member since:</span>
            <span className="text-xs">
              {format(parseISO(subscription.created_at), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        {subscription.status === 'active' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-destructive/50 hover:bg-destructive/10"
                disabled={isCanceling}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Recurring Donation?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    Are you sure you want to cancel your recurring donation to{' '}
                    <strong>{subscription.funding_campaigns?.title}</strong>?
                  </p>
                  <p>
                    Your subscription will remain active until the end of the current billing period
                    ({format(parseISO(subscription.current_period_end), 'MMMM dd, yyyy')}).
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can always set up a new recurring donation later.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isCanceling ? 'Canceling...' : 'Yes, Cancel'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
};
