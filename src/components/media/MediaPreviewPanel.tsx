import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  Download, 
  Trash2,
  Image,
  Video,
  Music,
  FileText
} from 'lucide-react';
import type { MediaLibraryItem } from '@/types/mediaLibrary';
import { format } from 'date-fns';

interface MediaPreviewPanelProps {
  item: MediaLibraryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (id: string, updates: Partial<MediaLibraryItem>) => void;
  onDelete?: (id: string) => void;
  editable?: boolean;
}

const getMediaIcon = (type: MediaLibraryItem['type']) => {
  switch (type) {
    case 'image':
      return <Image className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'audio':
      return <Music className="h-5 w-5" />;
    case 'document':
      return <FileText className="h-5 w-5" />;
  }
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Unknown';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
  return `${mb.toFixed(2)} MB`;
};

export const MediaPreviewPanel: React.FC<MediaPreviewPanelProps> = ({
  item,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  editable = false,
}) => {
  const [editedTitle, setEditedTitle] = React.useState('');
  const [editedDescription, setEditedDescription] = React.useState('');

  React.useEffect(() => {
    if (item) {
      setEditedTitle(item.title);
      setEditedDescription(item.description || '');
    }
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    onUpdate?.(item.id, {
      title: editedTitle,
      description: editedDescription,
    });
  };

  const handleDownload = () => {
    window.open(item.public_url, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {getMediaIcon(item.type)}
            Media Preview
          </SheetTitle>
          <SheetDescription>
            View and edit media details
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Preview */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {item.type === 'image' && (
              <img
                src={item.public_url}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            )}
            {item.type === 'video' && (
              <video
                src={item.public_url}
                controls
                className="w-full h-full"
              />
            )}
            {item.type === 'audio' && (
              <div className="flex items-center justify-center h-full">
                <audio src={item.public_url} controls className="w-full px-4" />
              </div>
            )}
            {item.type === 'document' && (
              <div className="flex items-center justify-center h-full">
                <FileText className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={item.public_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </a>
            </Button>
            {editable && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>

          <Separator />

          {/* Editable Info */}
          {editable ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={item.status === 'approved' ? 'default' : 'secondary'}>
                {item.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize">{item.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">File Size</span>
              <span>{formatFileSize(item.file_size)}</span>
            </div>
            {item.width && item.height && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span>{item.width} × {item.height}px</span>
              </div>
            )}
            {item.duration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uploaded</span>
              <span>{format(new Date(item.uploaded_at), 'MMM d, yyyy')}</span>
            </div>
            {item.tags.length > 0 && (
              <div>
                <span className="text-muted-foreground block mb-2">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
