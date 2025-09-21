import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FileSubmission {
  fieldName: string;
  file: File;
  bucketName: string;
  uploadContext?: {
    uploader: 'participant' | 'sponsor' | 'admin' | 'project-owner' | 'user';
    userId?: string;
    submissionId?: string;
  };
}

export interface SubmissionContent {
  contact_info: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    organization?: string;
    website?: string;
  };
  additional_info: {
    motivation: string;
    experience?: string;
    availability?: string;
    [key: string]: unknown;
  };
  consent: {
    terms: boolean;
    privacy: boolean;
    marketing?: boolean;
    newsletter?: boolean;
  };
  [key: string]: unknown;
}

export interface BaseSubmissionPayload {
  type: 'participant' | 'project' | 'sponsor' | 'collaboration';
  title: string;
  content: SubmissionContent;
  contact_email: string;
  contact_phone?: string;
}

/**
 * Custom hook for handling public form submissions to Supabase
 * Handles file uploads and form data submission
 */
export const useSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const uploadFile = async (
    file: File,
    bucketName: string,
    context?: {
      fieldName: string;
      uploadContext?: {
        uploader: 'participant' | 'sponsor' | 'admin' | 'project-owner' | 'user';
        userId?: string;
        submissionId?: string;
      };
    }
  ): Promise<string | null> => {
    try {
      // Use organized naming if context provided
      let filePath: string;
      if (context?.uploadContext) {
        const namingPath = await generateOrganizedFilePath(file, bucketName, {
          uploader: context.uploadContext.uploader,
          submissionType: context.fieldName as any, // cv, portfolio, etc.
          userId: context.uploadContext.userId,
          submissionId: context.uploadContext.submissionId,
          originalName: file.name
        });
        filePath = namingPath;
      } else {
        // Fallback to simple naming for backward compatibility
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        filePath = `submissions/${fileName}`;
      }

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  const generateOrganizedFilePath = async (
    file: File,
    bucketName: string,
    context: any
  ): Promise<string> => {
    // Dynamic import to avoid circular dependency
    const { generateOrganizedFileName, getBucketForContext } = await import('@/utils/fileNaming');

    const organized = generateOrganizedFileName(file, context);
    // Use the determined bucket, but upload to the bucket passed in
    // (for cases where we want to override the bucket logic)
    return organized.fullPath;
  };

  const submitForm = async (
    type: 'participant' | 'project' | 'sponsor' | 'collaboration',
    basePayload: BaseSubmissionPayload,
    files: FileSubmission[] = []
  ): Promise<void> => {
    try {
      setIsSubmitting(true);
      setError('');

      // Upload files if any
      const fileUploads = await Promise.all(
        files.map(async ({ file, bucketName, uploadContext, fieldName }, index) => {
          const url = await uploadFile(file, bucketName, uploadContext ? { fieldName, uploadContext } : undefined);
          return { file, bucketName, url, fieldName };
        })
      );

      // Prepare submission data according to Supabase schema
      const submissionData = {
        ...basePayload,
        session_id: sessionStorage.getItem('session_id'),
        language_preference: navigator.language,
        how_found_us: 'website',
        publication_permission: basePayload.content.consent.marketing || false,
        // Group files by field name
        files: fileUploads.reduce((acc, { file, bucketName, url }, index) => {
          if (url) {
            // Use the original field name from FileSubmission
            const fileSubmission = files[index];
            if (fileSubmission) {
              acc[fileSubmission.fieldName] = url;
            }
          }
          return acc;
        }, {} as Record<string, string>),
      };

      // Submit to Supabase
      const { error: submitError } = await supabase
        .from('submissions')
        .insert(submissionData as any);

      if (submitError) throw submitError;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    submitForm,
    uploadFile,
    setError,
  };
};
