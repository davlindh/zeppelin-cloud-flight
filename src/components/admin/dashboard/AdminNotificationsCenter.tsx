import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

export const AdminNotificationsCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useAdminNotifications();
  const navigate = useNavigate();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500';
      case 'important': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${getUrgencyColor(notification.urgency)}`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : ''}`}>
                      {notification.title}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: sv })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
