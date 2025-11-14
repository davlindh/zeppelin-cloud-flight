import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PortfolioImageBatchUploadProps {
  providerId: string;
}

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const PortfolioImageBatchUpload = ({ providerId }: PortfolioImageBatchUploadProps) => {
  const queryClient = useQueryClient();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const
    }));
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    multiple: true,
    disabled: isUploading
  });

  const removeFile = (index: number) => {
    setUploadFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadAllFiles = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < uploadFiles.length; i++) {
      const uploadFile = uploadFiles[i];
      
      try {
        setUploadFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'uploading', progress: 0 };
          return newFiles;
        });

        // Upload to storage
        const fileExt = uploadFile.file.name.split('.').pop();
        const fileName = `${providerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('service-images')
          .upload(fileName, uploadFile.file);

        if (uploadError) throw uploadError;

        setUploadFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], progress: 50 };
          return newFiles;
        });

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(fileName);

        // Create portfolio item
        const cleanTitle = uploadFile.file.name
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
          .replace(/^\d+[-_]/, '') // Remove leading numbers
          .trim();

        const { error: insertError } = await supabase
          .from('service_portfolio_items')
          .insert({
            provider_id: providerId,
            title: cleanTitle || 'Uploaded Image',
            description: 'Uploaded via batch upload',
            category: 'general',
            image: publicUrl,
            images: [publicUrl],
            auto_generated: true,
            source_type: 'batch_upload'
          } as any);

        if (insertError) throw insertError;

        setUploadFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'success', progress: 100 };
          return newFiles;
        });

      } catch (err: any) {
        console.error('Upload error:', err);
        setUploadFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { 
            ...newFiles[i], 
            status: 'error', 
            progress: 0,
            error: err.message 
          };
          return newFiles;
        });
      }
    }

    const successCount = uploadFiles.filter(f => f.status === 'success').length;
    const failedCount = uploadFiles.filter(f => f.status === 'error').length;

    if (successCount > 0) {
      toast.success(`Laddade upp ${successCount} bilder!`);
      queryClient.invalidateQueries({ queryKey: ['service-portfolio', providerId] });
    }

    if (failedCount > 0) {
      toast.error(`${failedCount} bilder misslyckades`);
    }

    setIsUploading(false);
  };

  const clearCompleted = () => {
    setUploadFiles(prev => {
      const remaining = prev.filter(f => f.status !== 'success');
      prev.forEach(f => {
        if (f.status === 'success') {
          URL.revokeObjectURL(f.preview);
        }
      });
      return remaining;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Image Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg font-medium">Släpp bilderna här...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-1">Dra & släpp bilder här</p>
              <p className="text-sm text-muted-foreground">eller klicka för att välja filer</p>
              <p className="text-xs text-muted-foreground mt-2">
                Stödjer: PNG, JPG, JPEG, WEBP, GIF
              </p>
            </div>
          )}
        </div>

        {uploadFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {uploadFiles.length} {uploadFiles.length === 1 ? 'bild' : 'bilder'} redo
              </p>
              <div className="flex gap-2">
                {uploadFiles.some(f => f.status === 'success') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCompleted}
                    disabled={isUploading}
                  >
                    Rensa slutförda
                  </Button>
                )}
                <Button
                  onClick={uploadAllFiles}
                  disabled={isUploading || uploadFiles.every(f => f.status === 'success')}
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Ladda upp alla
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadFiles.map((uploadFile, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border bg-card"
                >
                  <img
                    src={uploadFile.preview}
                    alt={uploadFile.file.name}
                    className="w-full h-32 object-cover"
                  />
                  
                  {uploadFile.status === 'pending' && !isUploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {uploadFile.status === 'success' && (
                    <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                  )}

                  {uploadFile.status === 'error' && (
                    <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                  )}

                  {uploadFile.status === 'uploading' && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-2">
                      <div className="w-full space-y-1">
                        <Progress value={uploadFile.progress} className="h-1" />
                        <p className="text-xs text-center">{uploadFile.progress}%</p>
                      </div>
                    </div>
                  )}

                  <div className="p-2">
                    <p className="text-xs truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
