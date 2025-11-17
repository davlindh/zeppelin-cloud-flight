import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Donation } from '@/types/funding';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DonationListItemProps {
  donation: Donation & {
    funding_campaigns?: {
      id: string;
      title: string;
      slug: string;
    } | null;
  };
  isSelected: boolean;
  onClick: () => void;
}

export const DonationListItem: React.FC<DonationListItemProps> = ({
  donation,
  isSelected,
  onClick,
}) => {
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
    <Card
      className={cn(
        'p-4 cursor-pointer transition-colors hover:bg-accent/50',
        isSelected && 'border-primary bg-accent'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium truncate">
              {donation.is_anonymous ? 'Anonymous' : donation.donor_name || 'Guest'}
            </p>
            <Badge variant="outline" className={getStatusColor(donation.status)}>
              {donation.status}
            </Badge>
          </div>
          {donation.funding_campaigns && (
            <p className="text-sm text-muted-foreground truncate">
              {donation.funding_campaigns.title}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(donation.created_at), 'MMM d, yyyy HH:mm')}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {donation.amount.toLocaleString('sv-SE')} {donation.currency}
          </p>
        </div>
      </div>
    </Card>
  );
};
