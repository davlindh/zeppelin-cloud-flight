
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Zap, Clock, Users } from 'lucide-react';
import { AuctionAnalytics, EnhancedStatus } from '@/utils/auctionUtils';

interface EnhancedStatusBadgesProps {
  analytics: AuctionAnalytics;
  status: EnhancedStatus;
}

export const EnhancedStatusBadges: React.FC<EnhancedStatusBadgesProps> = ({
  analytics,
  status
}) => {
  const badges = [];

  // Activity Level Badge
  if (analytics.activityLevel === 'blazing') {
    badges.push(
      <Badge key="blazing" className="bg-red-600 text-white text-xs animate-pulse">
        <Flame className="h-3 w-3 mr-1" />
        Blazing
      </Badge>
    );
  } else if (analytics.activityLevel === 'hot') {
    badges.push(
      <Badge key="hot" className="bg-red-500 text-white text-xs">
        <Flame className="h-3 w-3 mr-1" />
        Hot
      </Badge>
    );
  } else if (analytics.activityLevel === 'warm') {
    badges.push(
      <Badge key="warm" className="bg-orange-500 text-white text-xs">
        <TrendingUp className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  }

  // Time Urgency Badge
  if (status.urgency === 'critical') {
    badges.push(
      <Badge key="critical" className="bg-red-700 text-white text-xs animate-pulse">
        <Clock className="h-3 w-3 mr-1" />
        Final Minutes!
      </Badge>
    );
  } else if (status.urgency === 'high') {
    badges.push(
      <Badge key="ending" className="bg-orange-600 text-white text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Ending Soon
      </Badge>
    );
  }

  // Value Badge
  if (status.value === 'exceptional') {
    badges.push(
      <Badge key="exceptional" className="bg-emerald-600 text-white text-xs">
        <TrendingUp className="h-3 w-3 mr-1" />
        Great Value
      </Badge>
    );
  }

  // Bidding Velocity Badge
  if (analytics.biddingVelocity === 'frenzied') {
    badges.push(
      <Badge key="frenzied" className="bg-purple-600 text-white text-xs">
        <Zap className="h-3 w-3 mr-1" />
        Frenzied
      </Badge>
    );
  } else if (analytics.biddingVelocity === 'fast') {
    badges.push(
      <Badge key="fast" className="bg-blue-600 text-white text-xs">
        <Users className="h-3 w-3 mr-1" />
        Fast Bidding
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges}
    </div>
  );
};
