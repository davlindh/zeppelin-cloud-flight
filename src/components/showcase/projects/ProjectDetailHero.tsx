import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Video, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMediaPlayer, MediaItem } from '@/media';

interface ProjectDetailHeroProps {
  project: {
    id: string;
    title: string;
    description: string;
    image_path?: string;
    associations?: string[];
    media?: Array<{
      type: string;
      url: string;
      title: string;
    }>;
  };
  isAdmin: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Helper function to get image URL
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return '/images/ui/placeholder-project.jpg';

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const { data } = supabase.storage
    .from('project-images')
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

export const ProjectDetailHero: React.FC<ProjectDetailHeroProps> = ({
  project,
  isAdmin,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const mediaSectionRef = useRef<HTMLDivElement>(null);
  const { playMedia } = useMediaPlayer();

  // Track loaded images to avoid displaying placeholders
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  };

  // Create MediaItem from project media data
  const createMediaItem = (media: { type: string; url: string; title: string }): MediaItem => ({
    id: `${project.id}-${media.url}`,
    type: media.type as MediaItem['type'],
    url: media.url,
    title: media.title,
    description: `Media från ${project.title}`,
  });

  // Handle media thumbnail click - Scroll to MediaManager section
  const handleMediaClick = (media: { type: string; url: string; title: string }) => {
    const mediaSection = document.getElementById('project-media-section');
    if (mediaSection) {
      // Smooth scroll to the MediaManager section
      mediaSection.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Optional: Add a highlight animation to draw attention
      mediaSection.classList.add('ring-2', 'ring-primary/50', 'transition-all', 'duration-500');
      setTimeout(() => {
        mediaSection.classList.remove('ring-2', 'ring-primary/50');
      }, 2000);
    }

    // Still play the media if it's available (for visual feedback)
    const mediaItem = createMediaItem(media);
    playMedia(mediaItem);
  };

  return (
    <div className="relative h-[32rem] md:h-[40rem] lg:h-[44rem] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={getImageUrl(project.image_path)}
          alt={project.title}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.currentTarget.src = '/images/ui/placeholder-project.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 h-full flex items-end">
        <div className="w-full max-w-6xl animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/showcase')}
            className="mb-6 md:mb-8 text-foreground/80 hover:text-foreground btn-glow backdrop-blur-md bg-background/30 border border-border/40 hover:bg-background/50 transition-all duration-300 shadow-elegant"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka till showcase
          </Button>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 md:mb-8 leading-[0.9] tracking-tight font-serif">
            {project.title}
          </h1>

          {/* Admin controls */}
          {isAdmin && (
            <div className="flex gap-3 mb-6 md:mb-8">
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="secondary"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 backdrop-blur-md"
                >
                  🗑️ Edit Project
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={onDelete}
                  variant="destructive"
                  className="bg-red-500/90 hover:bg-red-600 text-white border-red-500/30 backdrop-blur-md"
                >
                  🗑️ Delete Project
                </Button>
              )}
            </div>
          )}

          <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 mb-8 md:mb-10 max-w-5xl leading-relaxed font-light">
            {project.description}
          </p>

          {/* Tags */}
          {project.associations && project.associations.length > 0 && (
            <div className="flex flex-wrap gap-3 md:gap-4 animate-scale-in mb-8">
              {project.associations.map((assoc, index) => (
                <Badge key={`assoc-${index}`} variant="outline" className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium bg-background/40 backdrop-blur-md border-border/50 hover:bg-background/60 hover:scale-105 transition-all duration-300 shadow-soft">
                  {assoc}
                </Badge>
              ))}
            </div>
          )}

          {/* Media Thumbnail Preview */}
          {project.media && project.media.length > 0 && (() => {
            const images = project.media.filter(m => m.type === 'image').slice(0, 6);
            const videos = project.media.filter(m => m.type === 'video').slice(0, 2);
            const displayMedia = [...images, ...videos].slice(0, 6);
            
            if (displayMedia.length === 0) return null;
            
            return (
              <div className="mt-8 pt-6 border-t border-border/30 animate-fade-in backdrop-blur-md bg-background/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="h-4 w-4 text-foreground/80" />
                  <span className="text-sm text-foreground/80 font-medium">Projektmedia</span>
                  <Badge variant="outline" className="ml-2 bg-background/40 border-border/40">
                    {project.media.length} {project.media.length === 1 ? 'fil' : 'filer'}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {displayMedia.map((item, idx) => {
                    const isLoaded = loadedImages.has(idx);
                    return (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-border/20 hover:border-primary/40 transition-all duration-300"
                        onClick={() => handleMediaClick(item)}
                      >
                        {!isLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        <img
                          src={item.url}
                          alt={item.title}
                          loading="lazy"
                          onLoad={() => handleImageLoad(idx)}
                          className={cn(
                            "w-full h-full object-cover transition-all duration-300",
                            isLoaded
                              ? "opacity-100 group-hover:scale-110"
                              : "opacity-0"
                          )}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          {item.type === 'video' ? (
                            <Video className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {project.media.length > 6 && (
                    <div className="aspect-square rounded-lg bg-background/30 backdrop-blur-sm flex items-center justify-center text-foreground/80 text-sm font-medium border border-border/30 hover:border-primary/40 hover:bg-background/40 transition-all duration-300 cursor-pointer">
                      +{project.media.length - 6}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
