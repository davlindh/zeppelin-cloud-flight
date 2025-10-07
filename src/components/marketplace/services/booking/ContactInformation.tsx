
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { isValidString } from '@/utils/typeGuards';
import { useCustomerInfo } from '@/hooks/useCustomerInfo';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactInformationProps {
  contactInfo: ContactInfo;
  onContactInfoChange: (field: keyof ContactInfo, value: string) => void;
  errors?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
}

export const ContactInformation: React.FC<ContactInformationProps> = ({
  contactInfo,
  onContactInfoChange
}) => {
  const { customerInfo, saveCustomerInfo } = useCustomerInfo();

  // Auto-fill from saved customer info on mount
  useEffect(() => {
    if (customerInfo.name && !contactInfo.name) {
      onContactInfoChange('name', customerInfo.name);
    }
    if (customerInfo.email && !contactInfo.email) {
      onContactInfoChange('email', customerInfo.email);
    }
    if (customerInfo.phone && !contactInfo.phone) {
      onContactInfoChange('phone', customerInfo.phone);
    }
  }, [customerInfo, contactInfo, onContactInfoChange]);

  const handleInputChange = (field: keyof ContactInfo, value: string): void => {
    // Allow empty strings for optional fields, but validate non-empty strings
    if (value === ' || isValidString(value)) {
      onContactInfoChange(field, value);
      
      // Save to customer info for future use
      if (field === 'name') saveCustomerInfo({ name: value });
      if (field === 'email') saveCustomerInfo({ email: value });
      if (field === 'phone') saveCustomerInfo({ phone: value });
      if (field === 'message') saveCustomerInfo({ message: value });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-slate-900">Contact Information</h3>
      
      <Input
        placeholder="Your Name *"
        value={contactInfo.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
      />
      
      <Input
        type="email"
        placeholder="Email Address *"
        value={contactInfo.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
      />
      
      <Input
        type="tel"
        placeholder="Phone Number"
        value={contactInfo.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
      />
      
      <Textarea
        placeholder="Additional message or special requirements..."
        value={contactInfo.message}
        onChange={(e) => handleInputChange('message', e.target.value)}
        rows={3}
      />
    </div>
  );
};
