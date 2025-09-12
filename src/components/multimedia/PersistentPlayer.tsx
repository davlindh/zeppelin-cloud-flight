import React, { useEffect, useRef, useState } from 'react';
import { useMediaPlayer } from '@/contexts/MediaContext';
import { useCachedFile } from '@/hooks/useFileCache';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Minimize2,
  Maximize2,
  X,
  RotateCcw,
  Shuffle,
  Repeat,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PersistentPlayer: React.FC = () => {
  const {
    currentMedia,
    isPlaying,
    isPaused,
    progress,
    duration,
    volume,
    isMuted,
    isMinimized,
    queue,
    playbackRate,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    toggleMinimize,
    closePlayer,
    nextMedia,
    previousMedia,
    setPlaybackRate,
    shuffleQueue
  } = useMediaPlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlaybackRate, setShowPlaybackRate] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Use cached file for current media
  const { cachedUrl, isCached, cacheFile, needsPermission } = useCachedFile(
    currentMedia?.url || '', 
    {
      title: currentMedia?.title,
      type: currentMedia?.type
    }
  );

  // Use cached URL if available, otherwise use original
  const mediaUrl = cachedUrl || currentMedia?.url;

  // Auto-cache media when it starts playing, but check permissions first
  useEffect(() => {
    if (isPlaying && currentMedia && !isCached && !needsPermission) {
      cacheFile();
    }
  }, [isPlaying, currentMedia, isCached, cacheFile, needsPermission]);

  // Format time helper
  const formatTime = (timeInSeconds: number): string => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Don't render if no current media
  if (!currentMedia) return null;

  const isVideo = currentMedia.type === 'video';
  const isAudio = currentMedia.type === 'audio';

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 transition-all duration-300 animate-fade-in",
      isMinimized ? "w-80" : "w-96"
    )}>
      <Card className="card-enhanced border-0 shadow-glow bg-background/95 backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/20">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Badge variant={isVideo ? "default" : "secondary"} className="flex-shrink-0">
              {currentMedia.type?.toUpperCase()}
            </Badge>
            <h4 className="font-medium text-sm text-foreground truncate">
              {currentMedia.title}
            </h4>
            {isCached && (
              <div className="flex-shrink-0" title="Cached offline">
                <WifiOff className="h-3 w-3 text-green-600" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMinimize}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePlayer}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-4">
          {!isMinimized && (
            <>
              {/* Media Display */}
              {isVideo && (
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    src={mediaUrl}
                    className="w-full h-full object-contain"
                    controls={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={togglePlay}
                      className="h-16 w-16 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20"
                    >
                      {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                    </Button>
                  </div>
                </div>
              )}

              {isAudio && (
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-primary flex items-center justify-center">
                    {isPlaying ? <Pause className="h-8 w-8 text-primary-foreground" /> : <Play className="h-8 w-8 text-primary-foreground ml-1" />}
                  </div>
                  {currentMedia.description && (
                    <p className="text-sm text-muted-foreground">{currentMedia.description}</p>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={([value]) => seekTo(value)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime((progress / 100) * duration)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Playback Controls */}
            <div className="flex items-center gap-1">
              {queue.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={previousMedia}
                  className="h-8 w-8 p-0"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="h-10 w-10 p-0 hover:bg-primary hover:text-primary-foreground"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>

              {queue.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextMedia}
                  className="h-8 w-8 p-0"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center gap-1">
              {/* Queue Controls */}
              {queue.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shuffleQueue}
                  className="h-8 w-8 p-0"
                >
                  <Shuffle className="h-3 w-3" />
                </Button>
              )}

              {/* Playback Rate */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlaybackRate(!showPlaybackRate)}
                  className="h-8 w-8 p-0 text-xs font-mono"
                >
                  {playbackRate}×
                </Button>
                {showPlaybackRate && (
                  <div className="absolute bottom-full right-0 mb-2 bg-popover border border-border rounded-md p-1 shadow-lg">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <Button
                        key={rate}
                        variant={playbackRate === rate ? "default" : "ghost"}
                        size="sm"
                        onClick={() => {
                          setPlaybackRate(rate);
                          setShowPlaybackRate(false);
                        }}
                        className="block w-full text-xs"
                      >
                        {rate}×
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Volume Control */}
              <div className="relative flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className="h-8 w-8 p-0"
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                {showVolumeSlider && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 bg-popover border border-border rounded-md p-2 shadow-lg"
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <div className="w-20">
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setVolume(value)}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Download Link */}
              {currentMedia.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-8 p-0"
                  title={isCached ? "Downloaded (Cached)" : "Download"}
                >
                  <a
                    href={currentMedia.url}
                    download={currentMedia.title}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {isCached ? <WifiOff className="h-3 w-3" /> : <Download className="h-3 w-3" />}
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Queue Info */}
          {!isMinimized && queue.length > 1 && (
            <div className="text-xs text-muted-foreground text-center">
              {queue.findIndex(item => item.title === currentMedia.title) + 1} av {queue.length} i kö
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden media elements */}
      <audio ref={audioRef} src={mediaUrl} style={{ display: 'none' }} />
      <video ref={videoRef} src={mediaUrl} style={{ display: 'none' }} />
    </div>
  );
};