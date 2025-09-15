import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSubmissionMetadata } from '@/utils/sessionTracking';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface FormData {
  type: 'project' | 'participant' | 'partnership';
  title: string;
  description: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  roles: string[];
  experienceLevel: string;
  interests: string[];
  contributions: string[];
  timeCommitment: string;
  previousExperience: string;
  portfolioLinks: string;
  comments: string;
  purpose?: string;
  expectedImpact?: string;
  budget?: string;
  timeline?: string;
  languagePreference: string;
  howFoundUs: string;
  publicationPermission: boolean;
}

interface DraftSubmission {
  id: string;
  session_id: string;
  device_fingerprint?: string;
  form_data: FormData;
  uploaded_files: UploadedFile[];
  current_step: number;
  created_at: string;
  updated_at: string;
}

export const useAutoSave = () => {
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const saveDraft = useCallback(async (
    formData: FormData, 
    uploadedFiles: UploadedFile[], 
    currentStep: number
  ) => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      const metadata = getSubmissionMetadata();
      await supabase.rpc('set_session_context', {
        session_id: metadata.sessionId,
        device_fingerprint: metadata.deviceFingerprint
      });

      const draftData = {
        session_id: metadata.sessionId,
        device_fingerprint: metadata.deviceFingerprint,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form_data: formData as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        uploaded_files: uploadedFiles as any,
        current_step: currentStep
      };

      let result;
      
      if (draftId) {
        // Update existing draft
        result = await supabase
          .from('draft_submissions')
          .update(draftData)
          .eq('id', draftId)
          .select()
          .single();
      } else {
        // Create new draft
        result = await supabase
          .from('draft_submissions')
          .insert(draftData)
          .select()
          .single();
        
        if (result.data) {
          setDraftId(result.data.id);
        }
      }

      if (result.error) {
        console.error('Draft save error:', result.error);
        // Fallback to localStorage
        localStorage.setItem('submission_draft', JSON.stringify({
          formData,
          uploadedFiles,
          currentStep,
          timestamp: new Date().toISOString()
        }));
      } else {
        setLastSaved(new Date());
        // Clear localStorage backup if database save successful
        localStorage.removeItem('submission_draft');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      // Fallback to localStorage
      localStorage.setItem('submission_draft', JSON.stringify({
        formData,
        uploadedFiles,
        currentStep,
        timestamp: new Date().toISOString()
      }));
    } finally {
      setIsSaving(false);
    }
  }, [draftId, isSaving]);

  const loadDraft = useCallback(async (): Promise<{
    formData?: FormData;
    uploadedFiles?: UploadedFile[];
    currentStep?: number;
  } | null> => {
    try {
      const metadata = getSubmissionMetadata();
      await supabase.rpc('set_session_context', {
        session_id: metadata.sessionId,
        device_fingerprint: metadata.deviceFingerprint
      });

      const { data, error } = await supabase
        .from('draft_submissions')
        .select('*')
        .or(`session_id.eq.${metadata.sessionId},device_fingerprint.eq.${metadata.deviceFingerprint}`)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setDraftId(data.id);
        setLastSaved(new Date(data.updated_at));
        return {
          formData: data.form_data as unknown as FormData,
          uploadedFiles: data.uploaded_files as unknown as UploadedFile[],
          currentStep: data.current_step
        };
      }

      // Fallback to localStorage
      const localDraft = localStorage.getItem('submission_draft');
      if (localDraft) {
        const parsed = JSON.parse(localDraft);
        return {
          formData: parsed.formData,
          uploadedFiles: parsed.uploadedFiles,
          currentStep: parsed.currentStep
        };
      }
    } catch (error) {
      console.error('Load draft error:', error);
      
      // Try localStorage fallback
      const localDraft = localStorage.getItem('submission_draft');
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          return {
            formData: parsed.formData,
            uploadedFiles: parsed.uploadedFiles,
            currentStep: parsed.currentStep
          };
        } catch (parseError) {
          console.error('Local draft parse error:', parseError);
        }
      }
    }
    
    return null;
  }, []);

  const clearDraft = useCallback(async () => {
    try {
      if (draftId) {
        await supabase
          .from('draft_submissions')
          .delete()
          .eq('id', draftId);
      }
    } catch (error) {
      console.error('Clear draft error:', error);
    } finally {
      localStorage.removeItem('submission_draft');
      setDraftId(null);
      setLastSaved(null);
    }
  }, [draftId]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    lastSaved,
    isSaving,
    hasDraft: !!draftId
  };
};
