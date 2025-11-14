import React from 'react';
import { Bell, AlertCircle, Award, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useParticipantNotifications } from '@/hooks/marketplace/participant/useParticipantNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ParticipantNotificationsCenterProps {
  participantId?: string;
  className?: string;
}

const urgencyConfig = {
  urgent: {
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    badgeVariant: 'destructive' as const,
  },
  important: {
    icon: Star,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    badgeVariant: 'default' as const,
  },
  info: {
    icon: CheckCircle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    badgeVariant: 'secondary' as const,
  },
};

export const ParticipantNotificationsCenter: React.FC<ParticipantNotificationsCenterProps> = ({
  participantId,
  className,
}) => {
  const { data: notifications, isLoading } = useParticipantNotifications(participantId);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const config = urgencyConfig[notification.urgency];
                  const Icon = config.icon;

                  return (
                    <Link
                      key={notification.id}
                      to={notification.actionUrl || '#'}
                      className={cn(
                        "block p-4 hover:bg-accent/50 transition-colors",
                        !notification.read && "bg-accent/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-full", config.bgColor)}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <Badge variant={config.badgeVariant} className="text-xs">
                              {notification.urgency}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.relativeTime}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
