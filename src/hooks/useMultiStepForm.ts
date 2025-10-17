import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UseFormReturn, FieldValues } from 'react-hook-form';

interface MultiStepFormOptions<T extends FieldValues> {
  totalSteps: number;
  enableAutoSave?: boolean;
  autoSaveDebounceMs?: number;
  formType: 'participant' | 'project' | 'sponsor' | 'collaboration';
  form: UseFormReturn<T>;
}

interface DraftData {
  formData: Record<string, any>;
  uploadedFiles: Record<string, any>;
  currentStep: number;
}

export const useMultiStepForm = <T extends FieldValues>({
  totalSteps,
  enableAutoSave = true,
  autoSaveDebounceMs = 2000,
  formType,
  form,
}: MultiStepFormOptions<T>) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [sessionId] = useState(() => 
    sessionStorage.getItem('session_id') || `session-${Date.now()}`
  );

  // Progress calculation
  const progress = Math.round((currentStep / totalSteps) * 100);
  const completionPercentage = Math.round((completedSteps.length / totalSteps) * 100);

  // Session setup
  useEffect(() => {
    sessionStorage.setItem('session_id', sessionId);
  }, [sessionId]);

  // Check for existing draft on mount
  useEffect(() => {
    checkForDraft();
  }, []);

  const checkForDraft = async () => {
    try {
      const { data, error } = await supabase
        .from('draft_submissions')
        .select('*')
        .eq('session_id', sessionId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setHasDraft(true);
      }
    } catch (err) {
      console.error('Error checking for draft:', err);
    }
  };

  // Save draft to database
  const saveDraft = useCallback(async (uploadedFiles: Record<string, any> = {}) => {
    if (!enableAutoSave) return;

    try {
      setIsSaving(true);
      const formData = form.getValues();
      
      const draftData = {
        session_id: sessionId,
        device_fingerprint: navigator.userAgent,
        form_data: formData,
        uploaded_files: uploadedFiles,
        current_step: currentStep,
      };

      const { error } = await supabase
        .from('draft_submissions')
        .upsert(draftData, {
          onConflict: 'session_id',
        });

      if (error) throw error;

      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving draft:', err);
      // Fallback to localStorage
      localStorage.setItem(`draft_${formType}_${sessionId}`, JSON.stringify({
        formData: form.getValues(),
        uploadedFiles,
        currentStep,
      }));
    } finally {
      setIsSaving(false);
    }
  }, [enableAutoSave, form, sessionId, currentStep, formType]);

  // Load draft from database or localStorage
  const loadDraft = useCallback(async (): Promise<DraftData | null> => {
    try {
      const { data, error } = await supabase
        .from('draft_submissions')
        .select('*')
        .eq('session_id', sessionId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        return {
          formData: data.form_data as Record<string, any>,
          uploadedFiles: data.uploaded_files as Record<string, any>,
          currentStep: data.current_step,
        };
      }

      // Fallback to localStorage
      const localDraft = localStorage.getItem(`draft_${formType}_${sessionId}`);
      if (localDraft) {
        return JSON.parse(localDraft);
      }
    } catch (err) {
      console.error('Error loading draft:', err);
    }

    return null;
  }, [sessionId, formType]);

  // Clear draft
  const clearDraft = useCallback(async () => {
    try {
      await supabase
        .from('draft_submissions')
        .delete()
        .eq('session_id', sessionId);

      localStorage.removeItem(`draft_${formType}_${sessionId}`);
      setHasDraft(false);
    } catch (err) {
      console.error('Error clearing draft:', err);
    }
  }, [sessionId, formType]);

  // Step navigation
  const nextStep = useCallback(async (uploadedFiles?: Record<string, any>) => {
    if (currentStep < totalSteps) {
      const isValid = await form.trigger();
      if (isValid) {
        setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
        setCurrentStep(prev => prev + 1);
        
        if (enableAutoSave) {
          await saveDraft(uploadedFiles);
        }
      }
    }
  }, [currentStep, totalSteps, form, enableAutoSave, saveDraft]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  // Auto-save on form change
  useEffect(() => {
    if (!enableAutoSave) return;

    const subscription = form.watch(() => {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, autoSaveDebounceMs);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, enableAutoSave, autoSaveDebounceMs, saveDraft]);

  return {
    currentStep,
    totalSteps,
    progress,
    completionPercentage,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    saveDraft,
    loadDraft,
    clearDraft,
    lastSaved,
    isSaving,
    hasDraft,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
};
