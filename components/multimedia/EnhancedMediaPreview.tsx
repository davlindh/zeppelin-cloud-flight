import React, { useState } from 'react';
import { X, ExternalLink, Download, ZoomIn, Play, Pause } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { MediaItem } from '@/types/media';
import { cn } from '@/lib/utils';

interface EnhancedMediaPreviewProps {
  media: MediaItem;
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedMediaPreview: React.FC<EnhancedMediaPreviewProps> = ({
  media,
  isOpen,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const renderPreviewContent = () => {
    switch (media.type) {
      case 'image':
      case 'portfolio':
        return (
          <div className="relative group">
            <img 
              src={media.url}
              alt={media.title}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" asChild>
                <a href={media.url} target="_blank" rel="noopener noreferrer">
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Full storlek
                </a>
              </Button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            <video 
              controls 
              className="w-full max-h-[70vh] rounded-lg"
              poster={media.thumbnail}
            >
              <source src={media.url} />
              Din webbläsare stöder inte video-taggen.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </div>
              <h3 className="text-lg font-semibold mb-2">{media.title}</h3>
              {media.description && (
                <p className="text-muted-foreground mb-4">{media.description}</p>
              )}
            </div>
            <audio 
              controls 
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={media.url} />
              Din webbläsare stöder inte audio-taggen.
            </audio>
          </div>
        );

      case 'pdf':
        return (
          <div className="bg-muted/20 rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-20 bg-orange-100 dark:bg-orange-950 border-2 border-orange-200 dark:border-orange-800 rounded mx-auto mb-4 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">PDF</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{media.title}</h3>
              {media.description && (
                <p className="text-muted-foreground mb-4">{media.description}</p>
              )}
            </div>
            <iframe 
              src={`${media.url}#toolbar=0`}
              className="w-full h-[60vh] rounded border"
              title={media.title}
            />
          </div>
        );

      case 'presentation':
        return (
          <div className="bg-muted/20 rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="w-20 h-16 bg-indigo-100 dark:bg-indigo-950 border-2 border-indigo-200 dark:border-indigo-800 rounded mx-auto mb-4 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">PPT</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{media.title}</h3>
              {media.description && (
                <p className="text-muted-foreground mb-4">{media.description}</p>
              )}
            </div>
            <div className="bg-background border rounded p-4">
              <p className="text-sm text-muted-foreground mb-2">Presentation förhandsvisning</p>
              <Button asChild>
                <a href={media.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Öppna presentation
                </a>
              </Button>
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="bg-muted/20 rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-200 dark:border-emerald-800 rounded mx-auto mb-4 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">&lt;/&gt;</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{media.title}</h3>
              {media.description && (
                <p className="text-muted-foreground mb-4">{media.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <Button asChild>
                <a href={media.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visa kod
                </a>
              </Button>
            </div>
          </div>
        );

      case '3d':
        return (
          <div className="bg-muted/20 rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-950 border-2 border-cyan-200 dark:border-cyan-800 rounded mx-auto mb-4 flex items-center justify-center">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">3D</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{media.title}</h3>
              {media.description && (
                <p className="text-muted-foreground mb-4">{media.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <Button asChild>
                <a href={media.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visa 3D-modell
                </a>
              </Button>
            </div>
          </div>
        );

      case 'archive':
        return (
          <div className="bg-muted/20 rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 border-2 border-amber-200 dark:border-amber-800 rounded mx-auto mb-4 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">ZIP</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{media.title}</h3>
              {media.description && (
                <p className="text-muted-foreground mb-4">{media.description}</p>
              )}
              {media.size && (
                <p className="text-sm text-muted-foreground mb-4">
                  Storlek: {(media.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              )}
            </div>
            <Button asChild>
              <a href={media.url} download>
                <Download className="w-4 h-4 mr-2" />
                Ladda ner arkiv
              </a>
            </Button>
          </div>
        );

      default:
        return (
          <div className="bg-muted/20 rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">{media.title}</h3>
            {media.description && (
              <p className="text-muted-foreground mb-4">{media.description}</p>
            )}
            <Button asChild>
              <a href={media.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Öppna fil
              </a>
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate pr-8">{media.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          {renderPreviewContent()}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Typ: {media.type} • URL: <span className="truncate max-w-xs">{media.url}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={media.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Öppna
              </a>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Stäng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};