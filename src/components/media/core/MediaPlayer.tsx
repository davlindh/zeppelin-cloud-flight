import React, { useEffect, useRef } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronUp, ChevronDown, List, Gauge } from 'lucide-react';
import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image } from '@/components/media/Image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { generateMediaId } from '@/utils/media';

// Helper function to format time display
const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const MediaPlayer: React.FC = () => {
  const {
    currentMedia,
    queue,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isMinimized,
    playbackRate,
    togglePlay,
    previousMedia,
    nextMedia,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleMinimize,
    closePlayer,
    removeFromQueue,
    playMedia,
    setDuration,
  } = useMediaPlayer();

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  // Move all hooks before any conditional returns
  // Sync media element with state
  useEffect(() => {
    if (!mediaRef.current || !currentMedia) return;

    if (isPlaying) {
      mediaRef.current.play().catch(() => {
        // Handle autoplay restrictions
      });
    } else {
      mediaRef.current.pause();
    }
  }, [isPlaying, currentMedia]);

  useEffect(() => {
    if (!mediaRef.current || !currentMedia) return;
    mediaRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted, currentMedia]);

  useEffect(() => {
    if (!mediaRef.current || !currentMedia) return;
    mediaRef.current.playbackRate = playbackRate;
  }, [playbackRate, currentMedia]);

  useEffect(() => {
    if (!mediaRef.current || !duration || !currentMedia) return;
    const seekTime = (progress / 100) * duration;
    if (Math.abs(mediaRef.current.currentTime - seekTime) > 1) {
      mediaRef.current.currentTime = seekTime;
    }
  }, [progress, duration, currentMedia]);

  // Hide player if no media
  if (!currentMedia) return null;

  const currentTime = (progress / 100) * duration;
  const isVideo = currentMedia.type === 'video';

  return (
    <>
      {/* Hidden media element for playback */}
      <div className="hidden">
        {isVideo ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentMedia.url}
            onTimeUpdate={(e) => {
              const target = e.currentTarget;
              const progress = (target.currentTime / target.duration) * 100;
              seekTo(progress);
            }}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration);
            }}
            onEnded={() => {
              if (queue.length > 0) {
                nextMedia();
              }
            }}
          />
        ) : (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={currentMedia.url}
            onTimeUpdate={(e) => {
              const target = e.currentTarget;
              const progress = (target.currentTime / target.duration) * 100;
              seekTo(progress);
            }}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration);
            }}
            onEnded={() => {
              if (queue.length > 0) {
                nextMedia();
              }
            }}
          />
        )}
      </div>

      {/* Player UI */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border shadow-elegant transition-all duration-300 z-50',
          isMinimized ? 'h-16' : 'h-32'
        )}
      >
        <div className="container mx-auto h-full px-4">
          {/* Minimize/Close Controls */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleMinimize}
            >
              {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={closePlayer}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Minimized View */}
          {isMinimized ? (
            <div className="flex items-center gap-4 h-full py-2">
              {/* Thumbnail */}
              {currentMedia.thumbnail && (
                <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={currentMedia.thumbnail}
                    alt={currentMedia.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Now Playing Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentMedia.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentMedia.description || 'Now playing'}
                </p>
              </div>

              {/* Mini Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previousMedia}
                  disabled={queue.length === 0}
                  className="h-8 w-8"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={togglePlay}
                  className="h-10 w-10"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextMedia}
                  disabled={queue.length === 0}
                  className="h-8 w-8"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar (Mini) */}
              <div className="hidden md:block flex-1 max-w-xs">
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={([value]) => seekTo(value)}
                  className="cursor-pointer"
                />
              </div>

              {/* Time Display (Mini) */}
              <div className="hidden lg:block text-xs text-muted-foreground tabular-nums min-w-[80px] text-right">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          ) : (
            /* Maximized View */
            <div className="flex flex-col gap-2 h-full py-3">
              {/* Top Row: Now Playing + Main Controls */}
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                {currentMedia.thumbnail && (
                  <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={currentMedia.thumbnail}
                      alt={currentMedia.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Now Playing Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{currentMedia.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {currentMedia.description || 'Now playing'}
                  </p>
                </div>

                {/* Main Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={previousMedia}
                    disabled={queue.length === 0}
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={togglePlay}
                    className="h-12 w-12"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextMedia}
                    disabled={queue.length === 0}
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="hidden md:flex items-center gap-2 w-32">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-8 w-8"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={([value]) => setVolume(value)}
                    className="cursor-pointer"
                  />
                </div>

                {/* Playback Rate */}
                <Select
                  value={playbackRate.toString()}
                  onValueChange={(value) => setPlaybackRate(parseFloat(value))}
                >
                  <SelectTrigger className="w-20 h-8 hidden lg:flex">
                    <Gauge className="h-4 w-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>

                {/* Queue Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <List className="h-5 w-5" />
                      {queue.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {queue.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-96">
                    <SheetHeader>
                      <SheetTitle>Queue ({queue.length})</SheetTitle>
                      <SheetDescription>
                        Manage your media playback queue. Click items to play them, or use the X button to remove them.
                      </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                      <div className="space-y-2">
                        {queue.map((item) => {
                          const itemId = generateMediaId(item);
                          const isCurrentItem = currentMedia && generateMediaId(currentMedia) === itemId;
                          
                          return (
                            <div
                              key={itemId}
                              className={cn(
                                'flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors',
                                isCurrentItem && 'bg-accent border border-primary/20'
                              )}
                              onClick={() => playMedia(item)}
                            >
                              {item.thumbnail && (
                                <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                                  <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.title}</p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {isCurrentItem && (
                                <div className="flex-shrink-0 text-xs font-medium text-primary">
                                  Playing
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromQueue(itemId);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                        {queue.length === 0 && (
                          <p className="text-center text-muted-foreground text-sm py-8">
                            No items in queue
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Bottom Row: Progress Bar + Time */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground tabular-nums min-w-[40px]">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={([value]) => seekTo(value)}
                  className="flex-1 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground tabular-nums min-w-[40px] text-right">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden under the player */}
      <div className={cn('h-16 transition-all duration-300', !isMinimized && 'h-32')} />
    </>
  );
};
