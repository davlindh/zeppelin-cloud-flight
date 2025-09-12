import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Minimize2, Maximize2, X, List } from 'lucide-react';
import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import { getMediaIcon, formatDuration, isPlayableMedia } from '@/utils/mediaHelpers';
import { cn } from '@/lib/utils';

export const PersistentPlayer: React.FC = () => {
  const {
    currentMedia,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isMinimized,
    queue,
    togglePlay,
    nextMedia,
    previousMedia,
    seekTo,
    setVolume,
    toggleMute,
    toggleMinimize,
    closePlayer,
  } = useMediaPlayer();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const isAudio = currentMedia?.type === 'audio';
  const isVideo = currentMedia?.type === 'video';
  const mediaRef = isAudio ? audioRef : videoRef;
  
  // Handle media element updates
  useEffect(() => {
    const mediaElement = mediaRef.current;
    if (!mediaElement || !currentMedia) return;
    
    // Update source if different
    if (mediaElement.src !== currentMedia.url) {
      mediaElement.src = currentMedia.url;
    }
    
    // Play/pause based on state
    if (isPlaying && mediaElement.paused) {
      mediaElement.play().catch(console.error);
    } else if (!isPlaying && !mediaElement.paused) {
      mediaElement.pause();
    }
    
    // Update volume
    mediaElement.volume = isMuted ? 0 : volume / 100;
    
  }, [currentMedia, isPlaying, volume, isMuted, mediaRef]);
  
  // Don't show player if no current media or media is not playable
  if (!currentMedia || !isPlayableMedia(currentMedia.type)) {
    return null;
  }
  
  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    seekTo(newProgress);
    
    const mediaElement = mediaRef.current;
    if (mediaElement && duration > 0) {
      mediaElement.currentTime = (newProgress / 100) * duration;
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };
  
  const currentTime = (progress / 100) * duration;
  
  return (
    <>
      {/* Hidden media elements */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      <video ref={videoRef} style={{ display: 'none' }} />
      
      {/* Persistent player UI */}
      <div className={cn(
        "fixed z-50 bg-background/95 backdrop-blur-md border border-border shadow-lg transition-all duration-300",
        // Desktop positioning (bottom-right)
        "hidden md:block",
        isMinimized 
          ? "bottom-4 right-4 w-80 rounded-lg" 
          : "bottom-4 right-4 w-96 rounded-lg",
      )}>
        {isMinimized ? (
          // Minimized player
          <div className="flex items-center gap-3 p-3">
            <div className="flex-shrink-0">
              {getMediaIcon(currentMedia.type, 'w-5 h-5')}
            </div>
            
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentMedia.title}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                
                <div className="flex-grow bg-muted rounded-full h-1">
                  <div 
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={closePlayer}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Expanded player
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {currentMedia.title}
                </h4>
                {currentMedia.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {currentMedia.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMinimize}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={closePlayer}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={previousMedia}
                  disabled={queue.length === 0}
                  className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                
                <button
                  onClick={togglePlay}
                  className="p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={nextMedia}
                  disabled={queue.length === 0}
                  className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              
              {/* Volume control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
                
                {queue.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <List className="w-3 h-3" />
                    <span>{queue.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile player (bottom sticky bar) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden">
        <div className="flex items-center gap-3 p-3">
          <div className="flex-shrink-0">
            {getMediaIcon(currentMedia.type, 'w-5 h-5')}
          </div>
          
          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentMedia.title}
            </p>
            <div className="bg-muted rounded-full h-1 mt-1">
              <div 
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={previousMedia}
              disabled={queue.length === 0}
              className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={nextMedia}
              disabled={queue.length === 0}
              className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            
            <button
              onClick={closePlayer}
              className="p-2 hover:bg-muted rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};