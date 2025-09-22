import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

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
    acceptMarketing?: boolean;
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
  const queryClient = useQueryClient();

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
        type: basePayload.type,
        title: basePayload.title,
        content: basePayload.content,
        contact_email: basePayload.contact_email,
        contact_phone: basePayload.contact_phone,
        // Group files by field name - convert to array format expected by admin inbox
        files: fileUploads.reduce((acc, { file, bucketName, url }, index) => {
          if (url) {
            // Use the original field name from FileSubmission
            const fileSubmission = files[index];
            if (fileSubmission) {
              acc.push({
                fieldName: fileSubmission.fieldName,
                url: url,
                fileName: file.name,
                bucketName: bucketName
              });
            }
          }
          return acc;
        }, [] as Array<{ fieldName: string; url: string; fileName: string; bucketName: string }>),
        status: 'pending',
        submitted_by: sessionStorage.getItem('session_id') || `session-${Date.now()}`,
        how_found_us: 'website',
        language_preference: navigator.language,
        publication_permission: basePayload.content.consent.acceptMarketing || false,
      };

      // Submit to Supabase
      console.log('🔍 Submitting collaboration form data:', submissionData);

      const { data: insertedData, error: submitError } = await supabase
        .from('submissions')
        .insert(submissionData as any)
        .select()
        .single();

      if (submitError) {
        console.error('🔍 Submission error:', submitError);
        throw submitError;
      }

      console.log('✅ Collaboration form submitted successfully:', insertedData);

      // Invalidate and refetch submissions to update admin inbox
      queryClient.invalidateQueries({ queryKey: ['submissions'] });

      // Also invalidate sponsors query since collaboration submissions should become sponsors
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
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
