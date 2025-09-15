import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileUploadResult } from '@/types/admin';
import { logError } from '@/utils/adminApi';

interface UseFileUploadOptions {
  bucketName: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const { maxSizeMB = 10, allowedTypes = ['image/*'] } = options;

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    const isTypeAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<FileUploadResult> => {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'File validation error',
        description: validationError,
        variant: 'destructive'
      });
      return { success: false, error: validationError };
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from(options.bucketName)
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(100);

      const { data } = supabase.storage
        .from(options.bucketName)
        .getPublicUrl(filePath);

      toast({
        title: 'File uploaded successfully',
        description: `${file.name} has been uploaded.`,
      });

      return { success: true, url: data.publicUrl };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';

      logError(`fileUpload-${options.bucketName}`, error);

      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    validateFile
  };
};

// Helper hook for multiple file uploads
export const useMultipleFileUpload = (options: UseFileUploadOptions) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<FileUploadResult[]>([]);
  const { uploadFile, isUploading, uploadProgress } = useFileUpload(options);

  const addFile = (file: File) => {
    setFiles(prev => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAll = async () => {
    if (files.length === 0) {
      return { success: false, error: 'No files to upload' };
    }

    const results = await Promise.all(
      files.map(uploadFile)
    );

    setUploadResults(results);

    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      return {
        success: false,
        error: `${failed.length} files failed to upload`,
        results
      };
    }

    return { success: true, results };
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadResults([]);
  };

  return {
    files,
    uploadResults,
    addFile,
    removeFile,
    uploadAll,
    clearFiles,
    isUploading,
    uploadProgress
  };
};
