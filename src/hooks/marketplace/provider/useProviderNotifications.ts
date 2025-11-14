import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationItem } from '@/types/dashboard';
import { useEffect } from 'react';

export const useProviderNotifications = (providerId: string) => {
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['provider-notifications', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_notifications')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      return (data || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        urgency: n.urgency as 'urgent' | 'important' | 'info',
        timestamp: n.created_at,
        read: n.read,
        actionUrl: n.action_url,
        entityId: n.entity_id,
      })) as NotificationItem[];
    },
    enabled: !!providerId,
    staleTime: 30000, // 30 seconds
  });
  
  // Real-time subscription
  useEffect(() => {
    if (!providerId) return;
    
    const channel = supabase
      .channel('provider-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'provider_notifications',
          filter: `provider_id=eq.${providerId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['provider-notifications', providerId] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [providerId, queryClient]);
  
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('provider_notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
  });
  
  useEffect(() => {
    if (markAsReadMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['provider-notifications'] });
    }
  }, [markAsReadMutation.isSuccess, queryClient]);
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  
  return {
    notifications: notifications || [],
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
  };
};
