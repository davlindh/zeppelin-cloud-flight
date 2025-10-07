
import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCustomerInfo } from '@/hooks/useCustomerInfo';

interface InstantQuoteFormProps {
  providerId: string;
  providerName: string;
  providerEmail: string;
  serviceContext?: {
    serviceId?: string;
    serviceName?: string;
    servicePrice?: number;
  };
  onSubmit?: (formData: {
    name: string;
    email: string;
    phone: string;
    projectDescription: string;
    budget: string;
    timeline: string;
    additionalRequirements: string;
    preferredContact: 'email' | 'phone';
  }) => void;
}

export const InstantQuoteForm: React.FC<InstantQuoteFormProps> = ({
  onSubmit
}) => {
  const { customerInfo, saveCustomerInfo } = useCustomerInfo();
  const [formData, setFormData] = useState({
    name: ',
    email: '',
    phone: ',
    projectDescription: '',
    budget: ',
    timeline: '',
    additionalRequirements: ',
    preferredContact: 'email' as 'email' | 'phone'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from saved customer info on mount
  useEffect(() => {
    if (customerInfo.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: customerInfo.name }));
    }
    if (customerInfo.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: customerInfo.email }));
    }
    if (customerInfo.phone && !formData.phone) {
      setFormData(prev => ({ ...prev, phone: customerInfo.phone }));
    }
  }, [customerInfo, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error submitting quote request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Save to customer info for future use
    if (field === 'name') saveCustomerInfo({ name: value });
    if (field === 'email') saveCustomerInfo({ email: value });
    if (field === 'phone') saveCustomerInfo({ phone: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Address *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your.email@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Phone Number (Optional)
        </label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="Your phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Project Description *
        </label>
        <Textarea
          value={formData.projectDescription}
          onChange={(e) => handleChange('projectDescription', e.target.value)}
          placeholder="Describe your project or service needs in detail..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Budget Range
          </label>
          <Input
            value={formData.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
            placeholder="e.g. $500 - $1000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Timeline
          </label>
          <Input
            value={formData.timeline}
            onChange={(e) => handleChange('timeline', e.target.value)}
            placeholder="e.g. Within 2 weeks"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Additional Requirements
        </label>
        <Textarea
          value={formData.additionalRequirements}
          onChange={(e) => handleChange('additionalRequirements', e.target.value)}
          placeholder="Any specific requirements, preferences, or constraints..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Preferred Contact Method
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="email"
              checked={formData.preferredContact === 'email'}
              onChange={(e) => handleChange('preferredContact', e.target.value)}
              className="mr-2"
            />
            Email
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="phone"
              checked={formData.preferredContact === 'phone'}
              onChange={(e) => handleChange('preferredContact', e.target.value)}
              className="mr-2"
            />
            Phone
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <DollarSign className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Submitting...' : 'Request Quote'}
      </Button>

      <p className="text-xs text-slate-600 text-center">
        You'll receive a detailed quote within 24 hours.
      </p>
    </form>
  );
};
