import React, { useState } from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/shared/useRealtimeSubscription';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bell, ShoppingBag, Gavel, Calendar, Mail, Settings as SettingsIcon, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type NotificationType = 'order' | 'auction' | 'booking' | 'message' | 'system';
type NotificationPriority = 'urgent' | 'important' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  order: ShoppingBag,
  auction: Gavel,
  booking: Calendar,
  message: Mail,
  system: SettingsIcon
};

const priorityColors: Record<NotificationPriority, string> = {
  urgent: 'text-destructive',
  important: 'text-yellow-600',
  info: 'text-muted-foreground'
};

type FilterType = 'all' | NotificationType;

export const NotificationCenter: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id
  });

  // Real-time subscription for new notifications
  useRealtimeSubscription({
    table: 'notifications',
    filter: `user_id=eq.${user?.id}`,
    onInsert: (newNotification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Show toast for urgent notifications
      if (newNotification.priority === 'urgent') {
        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant: 'destructive'
        });
      }
    },
    enabled: !!user?.id
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'All notifications marked as read'
      });
    }
  });

  const filteredNotifications = notifications?.filter(
    n => filter === 'all' || n.type === filter
  );

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifikationer</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Markera alla
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-2 border-b overflow-x-auto">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Alla
          </Button>
          <Button
            variant={filter === 'order' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('order')}
          >
            <ShoppingBag className="h-3 w-3 mr-1" />
            Ordrar
          </Button>
          <Button
            variant={filter === 'auction' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('auction')}
          >
            <Gavel className="h-3 w-3 mr-1" />
            Auktioner
          </Button>
          <Button
            variant={filter === 'message' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('message')}
          >
            <Mail className="h-3 w-3 mr-1" />
            Meddelanden
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Laddar notifikationer...
            </div>
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const priorityColor = priorityColors[notification.priority];
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 ${priorityColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {notification.link && (
                            <Button
                              asChild
                              variant="link"
                              size="sm"
                              className="h-auto p-0"
                              onClick={() => setIsOpen(false)}
                            >
                              <Link to={notification.link}>Visa</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Inga notifikationer</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
