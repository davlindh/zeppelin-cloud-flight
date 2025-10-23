import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileIcon, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/utils/media';

interface UploadFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  metadata: {
    title: string;
    description: string;
    tags: string[];
  };
}

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (files: UploadFile[]) => Promise<void>;
  onUploadComplete?: () => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSizeMB?: number;
  entityType?: 'project' | 'participant' | 'sponsor';
  entityId?: string;
}

export const MediaUploadDialog: React.FC<MediaUploadDialogProps> = ({
  open,
  onOpenChange,
  onUpload,
  onUploadComplete,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  maxFiles = 10,
  maxSizeMB = 50,
  entityType,
  entityId,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'pending',
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        tags: [],
      },
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSizeMB * 1024 * 1024,
    maxFiles: maxFiles - files.length,
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateMetadata = (index: number, field: keyof UploadFile['metadata'], value: any) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].metadata[field] = value;
      return newFiles;
    });
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      if (onUpload) {
        // Simulate progress updates for demo
        for (let i = 0; i < files.length; i++) {
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress: 50 } : f
          ));
          await new Promise(resolve => setTimeout(resolve, 200));
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress: 100, status: 'complete' as const } : f
          ));
        }

        await onUpload(files);
      }
      setFiles([]);
      onUploadComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const,
        error: 'Uppladdning misslyckades'
      })));
    } finally {
      setUploading(false);
    }
  };

  const uploadedCount = files.filter(f => f.status === 'complete').length;
  const totalFiles = files.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Ladda upp media</DialogTitle>
          <DialogDescription>
            Dra och släpp filer eller klicka för att välja. Max {maxFiles} filer, {maxSizeMB}MB per fil.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Dropzone */}
          {files.length < maxFiles && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Släpp filerna här..."
                  : "Dra och släpp filer här, eller klicka för att välja"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {acceptedTypes.join(', ')} - Max {maxSizeMB}MB
              </p>
            </div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-3">
              {files.map((uploadFile, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {uploadFile.preview ? (
                        <img
                          src={uploadFile.preview}
                          alt={uploadFile.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{uploadFile.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(uploadFile.file.size)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`title-${index}`} className="text-xs">
                            Titel
                          </Label>
                          <Input
                            id={`title-${index}`}
                            value={uploadFile.metadata.title}
                            onChange={(e) => updateMetadata(index, 'title', e.target.value)}
                            disabled={uploading}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`description-${index}`} className="text-xs">
                            Beskrivning
                          </Label>
                          <Input
                            id={`description-${index}`}
                            value={uploadFile.metadata.description}
                            onChange={(e) => updateMetadata(index, 'description', e.target.value)}
                            disabled={uploading}
                            className="h-8"
                          />
                        </div>
                      </div>

                      {/* Progress */}
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="h-2" />
                      )}

                      {/* Status */}
                      {uploadFile.status === 'complete' && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Uppladdad
                        </Badge>
                      )}

                      {uploadFile.status === 'error' && (
                        <Badge variant="destructive">
                          {uploadFile.error || 'Uppladdning misslyckades'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-3">
          {uploading && totalFiles > 0 && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Laddar upp filer...
                </span>
                <span className="font-medium">
                  {uploadedCount} av {totalFiles} filer
                </span>
              </div>
              <Progress value={(uploadedCount / totalFiles) * 100} className="h-2" />
            </div>
          )}
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Avbryt
            </Button>
            <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
              {uploading ? `Laddar upp... (${uploadedCount}/${totalFiles})` : `Ladda upp ${files.length} fil${files.length !== 1 ? 'er' : ''}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
