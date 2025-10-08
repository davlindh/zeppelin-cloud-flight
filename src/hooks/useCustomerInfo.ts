import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';
import { transformCustomerInfoToProfile } from '@/utils/transforms/database';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  message?: string;
  agreedToTerms?: boolean;
}

const STORAGE_KEY = 'customer_info';

export const useCustomerInfo = () => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    message: '',
    agreedToTerms: false,
  });
  const { isAuthenticated, profile, updateProfile } = useUserProfile();

  // Load customer info from profile or localStorage
  useEffect(() => {
    if (isAuthenticated && profile) {
      // For authenticated users, populate from profile
      setCustomerInfo(prev => ({
        ...prev,
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        // Keep other fields from localStorage if available
      }));
    } else {
      // For guests, load from localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setCustomerInfo(prev => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        console.warn('Failed to load customer info from storage:', error);
      }
    }
  }, [isAuthenticated, profile]);

  // Save customer info to localStorage and optionally to profile
  const saveCustomerInfo = async (info: Partial<CustomerInfo>) => {
    const updated = { ...customerInfo, ...info };
    setCustomerInfo(updated);
    
    try {
      // Always save to localStorage for immediate access
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // If authenticated, also update the user profile
      if (isAuthenticated && updateProfile) {
        const profileUpdates = transformCustomerInfoToProfile(updated);
        await updateProfile(profileUpdates);
      }
    } catch (error) {
      console.warn('Failed to save customer info:', error);
    }
  };

  // Update specific field
  const updateField = (field: keyof CustomerInfo, value: string | boolean) => {
    saveCustomerInfo({ [field]: value });
  };

  // Get auto-fill data for forms
  const getFormData = () => ({
    firstName: customerInfo.name.split(' ')[0] || '',
    lastName: customerInfo.name.split(' ').slice(1).join(' ') || '',
    email: customerInfo.email,
    phone: customerInfo.phone,
    address: customerInfo.address || '',
    city: customerInfo.city || '',
    postalCode: customerInfo.postalCode || '',
    country: customerInfo.country || '',
    message: customerInfo.message || '',
    agreedToTerms: customerInfo.agreedToTerms || false,
  });

  // Clear all customer info
  const clearCustomerInfo = () => {
    const empty: CustomerInfo = {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      message: '',
      agreedToTerms: false,
    };
    setCustomerInfo(empty);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    customerInfo,
    saveCustomerInfo,
    updateField,
    getFormData,
    clearCustomerInfo,
  };
};