import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, CheckCircle2 } from 'lucide-react';
import { uploadMultipleToMediaLibrary } from '@/utils/mediaUpload';
import type { MediaLibraryItem } from '@/types/mediaLibrary';
import { cn } from '@/lib/utils';

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (items: MediaLibraryItem[]) => void;
  defaultFolder?: string;
  autoApprove?: boolean;
}

export const MediaUploadDialog: React.FC<MediaUploadDialogProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
  defaultFolder = 'admin',
  autoApprove = true,
}) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [uploadedItems, setUploadedItems] = React.useState<MediaLibraryItem[]>([]);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const { success, failed } = await uploadMultipleToMediaLibrary(files, {
        folder: defaultFolder,
        autoApprove,
      });

      setProgress(100);
      setUploadedItems(success);

      if (failed.length > 0) {
        toast({
          title: 'Partial Upload',
          description: `${success.length} files uploaded, ${failed.length} failed`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `${success.length} files uploaded successfully`,
        });
      }

      onUploadComplete?.(success);
      
      // Close dialog after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setProgress(0);
    setUploadedItems([]);
    onOpenChange(false);
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload images, videos, audio, or documents to the media library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          {files.length === 0 && (
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop files here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports images, videos, audio, and PDFs up to 50MB
                  </p>
                </>
              )}
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Files ({files.length}) - {totalSizeMB} MB
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiles([])}
                >
                  Clear All
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 p-2 bg-muted rounded"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    {uploadedItems.some(item => item.original_filename === file.name) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              {!uploading && (
                <div
                  {...getRootProps()}
                  className="border border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-muted-foreground">
                    Click or drag to add more files
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Uploading files...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              Upload {files.length > 0 && `(${files.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
