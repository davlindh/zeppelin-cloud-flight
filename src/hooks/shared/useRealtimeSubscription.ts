import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionProps {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
  enabled?: boolean;
}

export const useRealtimeSubscription = ({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true
}: UseRealtimeSubscriptionProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel(`realtime-${table}-${Date.now()}`);

    // Build the configuration
    const config: any = {
      event,
      schema: 'public',
      table
    };

    if (filter) {
      config.filter = filter;
    }

    // Set up the subscription
    channel.on('postgres_changes', config, (payload) => {
      if (payload.eventType === 'INSERT' && onInsert) {
        onInsert(payload.new);
      } else if (payload.eventType === 'UPDATE' && onUpdate) {
        onUpdate(payload.new);
      } else if (payload.eventType === 'DELETE' && onDelete) {
        onDelete(payload.old);
      }
      
      if (onChange) {
        onChange(payload);
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${table} changes`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to ${table}`);
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, filter, onInsert, onUpdate, onDelete, onChange, enabled]);

  return channelRef.current;
};
