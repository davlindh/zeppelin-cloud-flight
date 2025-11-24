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
 * Generate organized file path for uploads
 */
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
  // For media-files bucket, use flat structure
  return organized.fullPath;
};

/**
 * Upload file to Supabase storage
 */
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

/**
 * Custom hook for handling public form submissions to Supabase
 * Handles file uploads and form data submission
 */
export const useSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const queryClient = useQueryClient();

  const submitForm = async (
    type: 'participant' | 'project' | 'sponsor' | 'collaboration',
    basePayload: BaseSubmissionPayload,
    files: FileSubmission[] = []
  ): Promise<{
    submissionId: string;
    submissionSlug: string | null;
    entityType: string | null;
    entityId: string | null;
    providerEntity?: {
      id: string;
      slug: string | null;
      status: string;
    } | null;
    sponsorEntity?: {
      id: string;
      slug: string | null;
      status: string;
    } | null;
  }> => {
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
        .maybeSingle();

      if (submitError) {
        console.error('🔍 Submission error:', submitError);
        throw submitError;
      }

      console.log('✅ Collaboration form submitted successfully:', insertedData);

      // Check if a participant, project, provider, or sponsor was created directly through this submission
      let createdEntity: any = null;
      let providerEntity: any = null;
      let sponsorEntity: any = null;
      
      if (insertedData && insertedData.content) {
        const content = insertedData.content as any;
        
        // Check if a participant was created directly
        if (insertedData.type === 'participant' && content.contact_info && content.contact_info.email) {
          // Try to find the participant with the matching email
          const { data: participantData } = await supabase
            .from('participants')
            .select('id, slug, contact_email')
            .eq('contact_email', content.contact_info.email)
            .maybeSingle();
            
          if (participantData) {
            createdEntity = {
              type: 'participant',
              id: participantData.id,
              slug: participantData.slug,
            };
          }
        }
        
        // Check if a service provider was created
        if ((insertedData.type === 'sponsor' || insertedData.type === 'collaboration') && content.contact_info && content.contact_info.email) {
          // Try to find the service provider with the matching email
          const providerResult: any = await (supabase as any)
            .from('service_providers')
            .select('id, slug, status')
            .eq('email', content.contact_info.email)
            .maybeSingle();
            
          const providerData = providerResult.data;
          if (providerData) {
            providerEntity = {
              id: providerData.id,
              slug: providerData.slug ?? null,
              status: providerData.status ?? null,
            };
          }
        }
        
        // Check if a sponsor was created
        if ((insertedData.type === 'sponsor' || insertedData.type === 'collaboration') && content.contact_info && content.contact_info.email) {
          // Try to find the sponsor with the matching email
          const sponsorResult: any = await (supabase as any)
            .from('sponsors')
            .select('id, slug, status')
            .eq('email', content.contact_info.email)
            .maybeSingle();
            
          const sponsorData = sponsorResult.data;
          if (sponsorData) {
            sponsorEntity = {
              id: sponsorData.id,
              slug: sponsorData.slug ?? null,
              status: sponsorData.status ?? null,
            };
          }
        }
      }

      // Invalidate and refetch submissions to update admin inbox
      queryClient.invalidateQueries({ queryKey: ['submissions'] });

      // Also invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      queryClient.invalidateQueries({ queryKey: ['serviceProviders'] });
      
      return {
        submissionId: insertedData?.id || '',
        submissionSlug: createdEntity?.slug || null,
        entityType: createdEntity?.type || null,
        entityId: createdEntity?.id || null,
        providerEntity: providerEntity,
        sponsorEntity: sponsorEntity,
      };
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
