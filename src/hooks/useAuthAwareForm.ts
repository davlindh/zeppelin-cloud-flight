import { useEffect, useState, useCallback } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerInfo } from '@/hooks/useCustomerInfo';

interface AuthAwareFormOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  emailField?: string;
  checkDuplicateEmail?: boolean;
}

export const useAuthAwareForm = <T extends FieldValues>({
  form,
  emailField = 'email',
  checkDuplicateEmail = true,
}: AuthAwareFormOptions<T>) => {
  const { customerInfo, getFormData } = useCustomerInfo();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();
        
        setUserProfile(profile);
      }
    };

    checkAuth();
  }, []);

  // Auto-populate form from profile
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      const formData = getFormData();
      
      // Populate form with available data
      Object.entries(formData).forEach(([key, value]) => {
        if (value && form.getValues(key as any) === undefined) {
          form.setValue(key as any, value as any, { shouldValidate: false });
        }
      });
    } else if (!isAuthenticated && customerInfo) {
      // Populate from localStorage for guests
      const formData = getFormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value && form.getValues(key as any) === undefined) {
          form.setValue(key as any, value as any, { shouldValidate: false });
        }
      });
    }
  }, [isAuthenticated, userProfile, customerInfo, form, getFormData]);

  // Check if email already exists
  const checkEmailDuplication = useCallback(async (email: string): Promise<boolean> => {
    if (!checkDuplicateEmail || !email) return false;

    try {
      setCheckingEmail(true);

      // Check in participants table
      const { data: participantData } = await supabase
        .from('participants')
        .select('contact_email')
        .eq('contact_email', email)
        .maybeSingle();

      if (participantData) {
        setEmailExists(true);
        return true;
      }

      // Check in submissions table
      const { data: submissionData } = await supabase
        .from('submissions')
        .select('contact_email')
        .eq('contact_email', email)
        .maybeSingle();

      if (submissionData) {
        setEmailExists(true);
        return true;
      }

      setEmailExists(false);
      return false;
    } catch (err) {
      console.error('Error checking email duplication:', err);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  }, [checkDuplicateEmail]);

  // Smart field suggestions
  const getSuggestions = useCallback((fieldName: string): string[] => {
    const suggestions: string[] = [];

    if (customerInfo) {
      switch (fieldName) {
        case 'name':
        case 'firstName':
          if (customerInfo.name) suggestions.push(customerInfo.name);
          break;
        case 'email':
          if (customerInfo.email) suggestions.push(customerInfo.email);
          break;
        case 'phone':
          if (customerInfo.phone) suggestions.push(customerInfo.phone);
          break;
        case 'city':
          if (customerInfo.city) suggestions.push(customerInfo.city);
          break;
      }
    }

    return suggestions;
  }, [customerInfo]);

  return {
    isAuthenticated,
    userProfile,
    emailExists,
    checkingEmail,
    checkEmailDuplication,
    getSuggestions,
    hasStoredData: !!customerInfo,
  };
};
