import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Camera } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { CameraCapture } from '@/components/admin/CameraCapture';
import { BUCKET_MAP } from '@/config/storage.config';
import { useState } from 'react';

interface ServiceImageUploadProps {
  onImageUploaded: (url: string) => void;
  disabled?: boolean;
  enableCamera?: boolean;
}

export const ServiceImageUpload: React.FC<ServiceImageUploadProps> = ({
  onImageUploaded,
  disabled = false,
  enableCamera = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { uploadToSupabase, uploadProgress } = useImageUpload();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadToSupabase(file, BUCKET_MAP.SERVICES);
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

  const handleCameraCapture = (result: { url: string; path: string; file: File }) => {
    setShowCamera(false);
    onImageUploaded(result.url);
  };

  return (
    <>
      <div className="flex gap-2">
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
        
        {enableCamera && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCamera(true)}
            disabled={disabled || uploadProgress.isUploading}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Camera
          </Button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showCamera && (
        <CameraCapture
          onImageCapture={handleCameraCapture}
          bucket={BUCKET_MAP.SERVICES}
        />
      )}
    </>
  );
};