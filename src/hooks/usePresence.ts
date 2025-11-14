import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PresenceState {
  user_id: string;
  online_at: string;
  [key: string]: any;
}

export const usePresence = (channelName: string = 'presence', userState?: PresenceState) => {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceState[]>>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userState?.user_id) return;

    const presenceChannel = supabase.channel(channelName);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState<PresenceState>();
        setOnlineUsers(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track(userState);
        }
      });

    setChannel(presenceChannel);

    // Heartbeat to maintain presence
    const heartbeat = setInterval(() => {
      if (presenceChannel) {
        presenceChannel.track({
          ...userState,
          online_at: new Date().toISOString()
        });
      }
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(heartbeat);
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [channelName, userState?.user_id]);

  const isUserOnline = (userId: string): boolean => {
    return Object.values(onlineUsers).some(presences =>
      presences.some(p => p.user_id === userId)
    );
  };

  const getUserPresence = (userId: string): PresenceState | null => {
    for (const presences of Object.values(onlineUsers)) {
      const userPresence = presences.find(p => p.user_id === userId);
      if (userPresence) return userPresence;
    }
    return null;
  };

  return {
    onlineUsers,
    isUserOnline,
    getUserPresence,
    channel
  };
};
