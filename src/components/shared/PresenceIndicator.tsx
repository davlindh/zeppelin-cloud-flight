import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { usePresence } from '@/hooks/usePresence';

interface PresenceIndicatorProps {
  userId: string;
  showLabel?: boolean;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  userId,
  showLabel = false,
  className = ''
}) => {
  const { isUserOnline, getUserPresence } = usePresence();
  
  const isOnline = isUserOnline(userId);
  const presence = getUserPresence(userId);

  const getStatusColor = () => {
    if (isOnline) return 'bg-green-500';
    
    // Check if last seen was within 5 minutes (away status)
    if (presence?.online_at) {
      const lastSeen = new Date(presence.online_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (lastSeen > fiveMinutesAgo) {
        return 'bg-yellow-500';
      }
    }
    
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (isOnline) return 'Online';
    
    if (presence?.online_at) {
      const lastSeen = new Date(presence.online_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (lastSeen > fiveMinutesAgo) {
        return 'Away';
      }
      return `Senast online ${formatDistanceToNow(lastSeen, { addSuffix: true })}`;
    }
    
    return 'Offline';
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
              <span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} />
              {isOnline && (
                <span className={`absolute inset-0 h-2 w-2 rounded-full ${statusColor} animate-ping opacity-75`} />
              )}
            </div>
            {showLabel && (
              <span className="text-xs text-muted-foreground">{statusText}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
