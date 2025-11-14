import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationItem } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItemCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClick?: (notification: NotificationItem) => void;
}

export const NotificationItemCard = ({
  notification,
  onMarkAsRead,
  onDismiss,
  onClick,
}: NotificationItemCardProps) => {
  const navigate = useNavigate();

  const urgencyColors = {
    urgent: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    important: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    onClick?.(notification);
  };

  return (
    <div
      className={`w-full p-3 hover:bg-accent/50 transition-colors ${
        !notification.read ? 'bg-accent/20' : ''
      } ${notification.actionUrl ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <Badge 
          variant="outline" 
          className={`${urgencyColors[notification.urgency]} shrink-0`}
        >
          {notification.urgency}
        </Badge>
        
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight">{notification.title}</p>
            {!notification.read && (
              <div className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
