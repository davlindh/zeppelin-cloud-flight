import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { BUCKET_MAP } from '@/config/storage.config';

interface ProductImageUploadProps {
  onImageUploaded: (url: string) => void;
  disabled?: boolean;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  onImageUploaded,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadToSupabase, uploadProgress } = useImageUpload();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadToSupabase(file, BUCKET_MAP.PRODUCTS);
      if (result) {
        onImageUploaded(result.url);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploadProgress.isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploadProgress.isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        
        {uploadProgress.isUploading && (
          <div className="text-xs text-muted-foreground">
            Uploading: {uploadProgress.progress}%
          </div>
        )}
        
        {uploadProgress.error && (
          <div className="text-xs text-destructive">
            {uploadProgress.error}
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </>
  );
};