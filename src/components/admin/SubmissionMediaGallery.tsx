import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Download,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

interface SubmissionMediaGalleryProps {
  files: MediaFile[];
  submissionTitle?: string;
  className?: string;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName?.toLowerCase().split('.').pop() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon className="h-4 w-4" />;
  if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(ext)) return <Video className="h-4 w-4" />;
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return <Music className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
};

const getFileType = (filename: string) => {
  const ext = filename?.toLowerCase().split('.').pop();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(ext || '')) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext || '')) return 'audio';
  return 'document';
};

export const SubmissionMediaGallery: React.FC<SubmissionMediaGalleryProps> = ({
  files,
  submissionTitle,
  className
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!files || files.length === 0) return null;

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % files.length);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + files.length) % files.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') setSelectedIndex(null);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allImages = files.every((file) => getFileType(file.name || '') === 'image');

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
            <ImageIcon className="h-3 w-3 mr-1" />
            {files.length} {files.length === 1 ? 'fil' : 'filer'}
          </Badge>
          {allImages && files.length > 1 && (
            <span className="text-xs text-muted-foreground">
              Klicka för att förstora
            </span>
          )}
        </div>

        {/* Image Gallery Grid for multiple images */}
        {allImages && files.length > 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {files.map((file, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedIndex(index)}
              >
                <div className="aspect-square relative bg-muted">
                  <img
                    src={file.url}
                    alt={file.name || `Bild ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {/* Image number badge */}
                  <Badge className="absolute top-2 left-2 text-xs bg-black/70 text-white border-0">
                    {index + 1}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Individual file cards for mixed types or single files */
          <div className="grid gap-3">
            {files.map((file, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.name || '')}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name || `Fil ${index + 1}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.type} {file.size && `• ${Math.round(file.size / 1024)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadFile(file.url, file.name || 'file')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {getFileType(file.name || '') === 'image' && (
                  <div className="mt-3 border rounded-lg overflow-hidden">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-auto max-h-64 object-contain bg-muted"
                      loading="lazy"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Gallery Modal */}
      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          {selectedIndex !== null && (
            <div
              className="relative w-full h-full bg-black/95"
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Image info */}
              <div className="absolute top-4 left-4 z-50 text-white">
                <Badge className="bg-black/70 text-white border-0">
                  {selectedIndex + 1} / {files.length}
                </Badge>
                {files[selectedIndex].name && (
                  <p className="mt-2 text-sm">{files[selectedIndex].name}</p>
                )}
              </div>

              {/* Navigation buttons */}
              {files.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Main image */}
              <div className="flex items-center justify-center w-full h-[95vh] p-8">
                <img
                  src={files[selectedIndex].url}
                  alt={files[selectedIndex].name || `Bild ${selectedIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Download button */}
              <div className="absolute bottom-4 right-4 z-50">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadFile(files[selectedIndex].url, files[selectedIndex].name || 'image')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ladda ner
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
