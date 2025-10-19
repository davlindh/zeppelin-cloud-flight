import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, FileIcon, Image, Video, Music, FileText } from 'lucide-react';
import { formatFileSize } from '@/utils/formatFileSize';

interface StorageImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const bucketOptions = [
  { id: 'media-files', name: 'Media Files' },
  { id: 'project-images', name: 'Project Images' },
  { id: 'participant-avatars', name: 'Participant Avatars' },
  { id: 'sponsor-logos', name: 'Sponsor Logos' },
];

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
  if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-4 w-4" />;
  return <FileIcon className="h-4 w-4" />;
};

const getMediaType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
};

export const StorageImportDialog: React.FC<StorageImportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBucket, setSelectedBucket] = useState<string>('media-files');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Fetch files from selected bucket
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['storage-files', selectedBucket],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(selectedBucket)
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      // Get public URLs and metadata
      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from(selectedBucket)
            .getPublicUrl(file.name);

          // Check if file already exists in media_library
          const { data: existing } = await supabase
            .from('media_library')
            .select('id')
            .eq('storage_path', file.name)
            .eq('bucket', selectedBucket)
            .single();

          return {
            ...file,
            publicUrl: urlData.publicUrl,
            alreadyImported: !!existing,
          };
        })
      );

      return filesWithUrls.filter(f => !f.alreadyImported);
    },
    enabled: open && !!selectedBucket,
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (filePaths: string[]) => {
      const imports = filePaths.map((path) => {
        const file = files.find(f => f.name === path);
        if (!file) throw new Error(`File not found: ${path}`);

        const { data: urlData } = supabase.storage
          .from(selectedBucket)
          .getPublicUrl(path);

        return {
          filename: file.name,
          original_filename: file.name,
          title: file.name.split('.')[0].replace(/[-_]/g, ' '),
          type: getMediaType(file.metadata?.mimetype || 'application/octet-stream'),
          mime_type: file.metadata?.mimetype || 'application/octet-stream',
          file_size: file.metadata?.size,
          bucket: selectedBucket,
          storage_path: path,
          public_url: urlData.publicUrl,
          status: 'approved',
          source: 'imported',
          is_public: true,
        };
      });

      const { error } = await supabase
        .from('media_library')
        .insert(imports);

      if (error) throw error;

      return imports.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['storage-files'] });
      
      toast({
        title: 'Import lyckades',
        description: `${count} fil${count !== 1 ? 'er' : ''} har importerats till mediabiblioteket.`,
      });
      
      setSelectedFiles([]);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Import misslyckades',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleFile = (fileName: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileName)
        ? prev.filter((f) => f !== fileName)
        : [...prev, fileName]
    );
  };

  const selectAll = () => {
    setSelectedFiles(files.map((f) => f.name));
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  const handleImport = () => {
    if (selectedFiles.length === 0) return;
    importMutation.mutate(selectedFiles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Importera från Storage
          </DialogTitle>
          <DialogDescription>
            Välj filer från storage buckets att importera till mediabiblioteket.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col">
          {/* Bucket Selector */}
          <div>
            <Label>Storage Bucket</Label>
            <Select value={selectedBucket} onValueChange={setSelectedBucket}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bucketOptions.map((bucket) => (
                  <SelectItem key={bucket.id} value={bucket.id}>
                    {bucket.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selection Controls */}
          {files.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedFiles.length} av {files.length} valda
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={selectAll}>
                  Välj alla
                </Button>
                {selectedFiles.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    Rensa
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* File List */}
          <ScrollArea className="flex-1 -mx-6 px-6 border rounded-lg">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Laddar filer...
              </div>
            ) : files.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Inga nya filer att importera
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                    onClick={() => toggleFile(file.name)}
                  >
                    <Checkbox
                      checked={selectedFiles.includes(file.name)}
                      onCheckedChange={() => toggleFile(file.name)}
                    />
                    
                    <div className="flex-shrink-0">
                      {getFileIcon(file.metadata?.mimetype || '')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.metadata?.size)}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {getMediaType(file.metadata?.mimetype || '')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedFiles.length === 0 || importMutation.isPending}
          >
            {importMutation.isPending
              ? 'Importerar...'
              : `Importera ${selectedFiles.length} fil${selectedFiles.length !== 1 ? 'er' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};