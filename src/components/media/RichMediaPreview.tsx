import { Music, FileText, Download, Eye } from "lucide-react";
import type { MediaLibraryItem } from "@/types/mediaLibrary";
import { cn } from "@/lib/utils";

interface RichMediaPreviewProps {
  item: MediaLibraryItem;
  className?: string;
}

export function RichMediaPreview({ item, className }: RichMediaPreviewProps) {
  if (!item) return null;

  // Get the best quality image URL
  const imageUrl = item.public_url || item.thumbnail_url;

  if (item.type === 'image') {
    return (
      <div className={cn('relative w-full h-full flex items-center justify-center bg-muted', className)}>
        <img
          src={imageUrl}
          alt={item.title}
          className="max-w-full max-h-full object-contain rounded-lg"
          loading="lazy"
          onError={(e) => {
            console.error('Failed to load image:', imageUrl);
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>
    );
  }

  if (item.type === 'video') {
    return (
      <div className={cn('relative w-full h-full bg-black', className)}>
        <video
          src={imageUrl}
          controls
          className="w-full h-full rounded-lg"
          poster={item.thumbnail_url}
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (item.type === 'audio') {
    return (
      <div className={cn('relative w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500/10 to-emerald-500/10', className)}>
        <div className="w-full max-w-2xl p-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-6 rounded-full bg-green-500/20">
              <Music className="h-24 w-24 text-green-500" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {item.duration && (
              <p className="text-sm text-muted-foreground">
                Duration: {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
              </p>
            )}
          </div>
          <audio
            src={imageUrl}
            controls
            className="w-full"
            preload="metadata"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      </div>
    );
  }

  // Document preview
  return (
    <div className={cn('relative w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/10 to-amber-500/10', className)}>
      <div className="text-center space-y-6 p-8">
        <div className="inline-flex p-6 rounded-full bg-orange-500/20">
          <FileText className="h-24 w-24 text-orange-500" />
        </div>
        <div>
          <p className="text-xl font-semibold">{item.title}</p>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
            {item.mime_type?.split('/')[1] || 'Document'}
          </p>
          {item.file_size && (
            <p className="text-sm text-muted-foreground mt-1">
              {(item.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Open
          </a>
          <a
            href={imageUrl}
            download
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
