
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Users } from 'lucide-react';

interface LiveStatusIndicatorProps {
  isLive: boolean;
  liveBidders: number;
  className?: string;
}

export const LiveStatusIndicator: React.FC<LiveStatusIndicatorProps> = ({
  isLive,
  liveBidders,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isLive ? (
        <Badge className="bg-red-600 text-white animate-pulse">
          <Wifi className="h-3 w-3 mr-1" />
          LIVE
        </Badge>
      ) : (
        <Badge variant="outline" className="text-slate-500">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )}
      
      {liveBidders > 0 && (
        <Badge variant="secondary" className="text-blue-600">
          <Users className="h-3 w-3 mr-1" />
          {liveBidders} watching
        </Badge>
      )}
    </div>
  );
};
