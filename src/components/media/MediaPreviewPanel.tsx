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
  Copy,
  Image,
  Video,
  Music,
  FileText
} from 'lucide-react';
import type { MediaLibraryItem } from '@/types/mediaLibrary';
import { format } from 'date-fns';
import { RichMediaPreview } from '@/components/media/RichMediaPreview';
import { formatFileSize } from '@/utils/formatFileSize';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
          {/* Rich Preview */}
          <div className="rounded-lg overflow-hidden bg-muted">
            {(item.type === 'image' || item.type === 'video' || item.type === 'audio') ? (
              <RichMediaPreview item={item} className="w-full" />
            ) : (
              <div className="aspect-video flex items-center justify-center">
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

          {/* Public URL */}
          <div className="space-y-2">
            <Label>Public URL</Label>
            <div className="flex gap-2">
              <Input value={item.public_url} readOnly className="flex-1 font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(item.public_url);
                  toast({ title: "URL copied to clipboard" });
                }}
                title="Copy URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                title="Open in new tab"
              >
                <a href={item.public_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <p className="text-sm font-medium capitalize flex items-center gap-2">
                {item.type}
                <Badge variant="outline" className="text-xs">
                  {item.mime_type?.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Size</Label>
              <p className="text-sm font-medium">{formatFileSize(item.file_size)}</p>
            </div>
            {item.width && item.height && (
              <div>
                <Label className="text-xs text-muted-foreground">Dimensions</Label>
                <p className="text-sm font-medium">{item.width} × {item.height}px</p>
              </div>
            )}
            {item.duration && (
              <div>
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <p className="text-sm font-medium">
                  {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                </p>
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Created</Label>
              <p className="text-sm font-medium">{format(new Date(item.created_at), 'PPp')}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Source</Label>
              <p className="text-sm font-medium capitalize">
                {item.source || 'Unknown'}
              </p>
            </div>
            {item.bucket && (
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Storage Path</Label>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {item.bucket}/{item.storage_path}
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
