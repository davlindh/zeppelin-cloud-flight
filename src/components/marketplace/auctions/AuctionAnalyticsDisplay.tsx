
import React from 'react';
import { TrendingUp, DollarSign, Users, Clock } from 'lucide-react';
import { AuctionAnalytics } from '@/utils/marketplace/auctionUtils';

interface AuctionAnalyticsDisplayProps {
  analytics: AuctionAnalytics;
  currentBid: number;
  startingBid: number;
  createdAt?: string;
  endTime: Date;
}

export const AuctionAnalyticsDisplay: React.FC<AuctionAnalyticsDisplayProps> = ({
  analytics,
  currentBid: _currentBid,
  startingBid: _startingBid,
  createdAt,
  endTime
}) => {
  const getAuctionDuration = () => {
    if (!createdAt) return null;
    const start = new Date(createdAt);
    const now = new Date();
    const daysRunning = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRunning === 0) return 'Started today';
    if (daysRunning === 1) return '1 day running';
    return `${daysRunning} days running`;
  };

  const formatValueAppreciation = (value: number) => {
    if (value === 0) return 'No increase yet';
    return `+${value.toFixed(0)}% increase`;
  };

  const getTimeProgress = () => {
    if (!createdAt) return 0;
    const start = new Date(createdAt).getTime();
    const end = endTime.getTime();
    const now = Date.now();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  return (
    <div className="space-y-2">
      {/* Value Appreciation */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-slate-600">
          <TrendingUp className="h-3 w-3" />
          <span>Value increase:</span>
        </div>
        <span className={`font-medium ${
          analytics.valueAppreciation > 0 ? 'text-green-600' : 'text-slate-600'
        }`}>
          {formatValueAppreciation(analytics.valueAppreciation)}
        </span>
      </div>

      {/* Bidding Activity */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-slate-600">
          <Users className="h-3 w-3" />
          <span>Avg bid increase:</span>
        </div>
        <span className="font-medium text-slate-900">
          ${analytics.avgBidIncrease.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>

      {/* Auction Duration */}
      {createdAt && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-slate-600">
            <Clock className="h-3 w-3" />
            <span>Duration:</span>
          </div>
          <span className="font-medium text-slate-900">
            {getAuctionDuration()}
          </span>
        </div>
      )}

      {/* Competitive Index */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-slate-600">
          <DollarSign className="h-3 w-3" />
          <span>Competition:</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(100, analytics.competitiveIndex)}%` }}
            />
          </div>
          <span className="font-medium text-slate-900 text-xs">
            {Math.round(analytics.competitiveIndex)}%
          </span>
        </div>
      </div>

      {/* Time Progress Bar */}
      {createdAt && (
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Auction progress</span>
            <span>{Math.round(getTimeProgress())}%</span>
          </div>
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
              style={{ width: `${getTimeProgress()}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
