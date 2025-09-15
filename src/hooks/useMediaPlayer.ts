import { useMediaPlayer as useMediaPlayerHook } from '@/contexts/MediaContext';

// Re-export the hook for convenience
export const useMediaPlayer = useMediaPlayerHook;

// Additional utility hooks for specific use cases
export const useMediaQueue = () => {
  const { queue, addToQueue, removeFromQueue, clearQueue, shuffleQueue } = useMediaPlayer();
  
  return {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    shuffleQueue,
    queueLength: queue.length,
  };
};

export const useMediaControls = () => {
  const { 
    isPlaying, 
    isPaused, 
    progress, 
    duration, 
    volume, 
    isMuted,
    playbackRate,
    togglePlay,
    pauseMedia,
    stopMedia,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,
    nextMedia,
    previousMedia
  } = useMediaPlayer();
  
  return {
    // State
    isPlaying,
    isPaused,
    progress,
    duration,
    volume,
    isMuted,
    playbackRate,
    
    // Controls
    togglePlay,
    pauseMedia,
    stopMedia,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,
    nextMedia,
    previousMedia,
  };
};

export const useCurrentMedia = () => {
  const { currentMedia, playMedia } = useMediaPlayer();
  
  return {
    currentMedia,
    playMedia,
    isMediaPlaying: (mediaUrl: string) => {
      return currentMedia?.url === mediaUrl;
    },
  };
};