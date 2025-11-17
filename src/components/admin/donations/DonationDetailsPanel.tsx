import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Donation } from '@/types/funding';
import { format } from 'date-fns';
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useDonationMutations } from '@/hooks/admin/useDonationMutations';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DonationDetailsPanelProps {
  donation: Donation & {
    funding_campaigns?: {
      id: string;
      title: string;
      slug: string;
    } | null;
  };
}

export const DonationDetailsPanel: React.FC<DonationDetailsPanelProps> = ({ donation }) => {
  const navigate = useNavigate();
  const { approveDonation, rejectDonation, refundDonation } = useDonationMutations();

  const handleApprove = () => {
    approveDonation.mutate(donation.id);
  };

  const handleReject = () => {
    rejectDonation.mutate(donation.id);
  };

  const handleRefund = () => {
    refundDonation.mutate(donation.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'succeeded':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Donation Details</CardTitle>
            <Badge variant="outline" className={`mt-2 ${getStatusColor(donation.status)}`}>
              {donation.status}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {donation.amount.toLocaleString('sv-SE')} {donation.currency}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Donor Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{donation.is_anonymous ? 'Anonymous' : donation.donor_name || 'N/A'}</span>
            </div>
            {!donation.is_anonymous && donation.donor_email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{donation.donor_email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Anonymous:</span>
              <span>{donation.is_anonymous ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Campaign</h3>
          {donation.funding_campaigns ? (
            <div className="flex items-center justify-between">
              <span className="text-sm">{donation.funding_campaigns.title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/campaigns/${donation.funding_campaigns?.slug}`)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No campaign linked</p>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider:</span>
              <span>{donation.payment_provider || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-mono text-xs">{donation.payment_reference || 'N/A'}</span>
            </div>
            {donation.fave_points_earned && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fave Points:</span>
                <span>{donation.fave_points_earned}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Timestamps</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{format(new Date(donation.created_at), 'MMM d, yyyy HH:mm')}</span>
            </div>
            {donation.confirmed_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmed:</span>
                <span>{format(new Date(donation.confirmed_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
            )}
          </div>
        </div>

        {donation.message && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Message</h3>
              <p className="text-sm text-muted-foreground">{donation.message}</p>
            </div>
          </>
        )}

        <Separator />

        <div className="flex flex-col gap-2">
          {donation.status === 'pending' && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" disabled={approveDonation.isPending}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Donation
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Donation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the donation as succeeded, update the campaign's raised amount, and award Fave points to the donor.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={rejectDonation.isPending}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Donation
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Donation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the donation as failed. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReject}>Reject</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {donation.status === 'succeeded' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full" disabled={refundDonation.isPending}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refund Donation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Refund Donation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reverse the donation, decrease the campaign's raised amount, and reverse any Fave points awarded.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRefund}>Refund</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
