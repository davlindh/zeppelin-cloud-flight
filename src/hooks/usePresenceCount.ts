import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { featureConfig } from '@/config/features.config';

interface PresenceData {
  watchersCount: number;
  isLoading: boolean;
  isConnected: boolean;
}

export const usePresenceCount = (itemId: string, itemType: 'auction' | 'product' | 'service'): PresenceData => {
  const [watchersCount, setWatchersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const currentSessionId = useRef<string>(Math.random().toString(36).substring(7));

  useEffect(() => {
    if (!featureConfig.socialProof.presence || !itemId) {
      setIsLoading(false);
      return;
    }

    const channelName = `presence:${itemType}:${itemId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Track tab visibility to pause presence when hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        channel.untrack();
      } else if (channelRef.current?.state === 'joined') {
        trackPresence();
      }
    };

    // Track current user's presence
    const trackPresence = async () => {
      if (document.hidden) return;
      
      const status = await channel.track({
        sessionId: currentSessionId.current,
        itemId,
        itemType,
        online_at: new Date().toISOString(),
      });
      
      console.log(`🔴 Presence tracking status for ${itemType} ${itemId}:`, status);
    };

    // Handle presence state changes
    const handlePresenceSync = () => {
      const presenceState = channel.presenceState();
      const allSessions = Object.keys(presenceState);
      
      // Don't count our own session
      const otherWatchers = allSessions.filter(sessionKey => {
        const sessionData = presenceState[sessionKey];
        return sessionData && !sessionData.some((presence: any) => presence.sessionId === currentSessionId.current);
      });
      
      const totalWatchers = otherWatchers.length;
      
      console.log(`👥 Presence sync for ${itemType} ${itemId}:`, {
        totalWatchers,
        allSessions: allSessions.length,
        excludedSelf: true
      });
      
      setWatchersCount(totalWatchers);
      setIsLoading(false);
      setIsConnected(true);
    };

    const handlePresenceJoin = ({ key, newPresences }: any) => {
      console.log(`👋 User joined ${itemType} ${itemId}:`, { key, newPresences });
      handlePresenceSync();
    };

    const handlePresenceLeave = ({ key, leftPresences }: any) => {
      console.log(`👋 User left ${itemType} ${itemId}:`, { key, leftPresences });
      handlePresenceSync();
    };

    // Set up event listeners
    channel
      .on('presence', { event: 'sync' }, handlePresenceSync)
      .on('presence', { event: 'join' }, handlePresenceJoin)
      .on('presence', { event: 'leave' }, handlePresenceLeave)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await trackPresence();
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log(`🔌 Unsubscribing from presence channel: ${channelName}`);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [itemId, itemType]);

  return {
    watchersCount,
    isLoading,
    isConnected,
  };
};