
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCustomerInfo } from '@/hooks/useCustomerInfo';

interface QuickConsultationFormProps {
  providerId: string;
  providerName: string;
  providerEmail: string;
  serviceContext?: {
    serviceId?: string;
    serviceName?: string;
    servicePrice?: number;
  };
  onSubmit?: (formData: any) => void;
}

export const QuickConsultationForm: React.FC<QuickConsultationFormProps> = ({
  onSubmit
}) => {
  const { customerInfo, saveCustomerInfo } = useCustomerInfo();
  const [formData, setFormData] = useState({
    name: ',
    email: '',
    phone: ',
    preferredDate: '',
    preferredTime: ',
    consultationType: 'phone' as 'phone' | 'video' | 'in-person',
    description: ',
    urgency: 'normal' as 'urgent' | 'normal' | 'flexible'
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
      console.error('Error submitting consultation request:', error);
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
            placeholder="your.email@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Phone Number
        </label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value)}
          placeholder="Your phone number"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Preferred Date
          </label>
          <Input
            type="date"
            value={formData.preferredDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('preferredDate', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Preferred Time
          </label>
          <Input
            type="time"
            value={formData.preferredTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('preferredTime', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Consultation Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="phone"
              checked={formData.consultationType === 'phone'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('consultationType', e.target.value)}
              className="mr-2"
            />
            Phone Call
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="video"
              checked={formData.consultationType === 'video'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('consultationType', e.target.value)}
              className="mr-2"
            />
            Video Call
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="in-person"
              checked={formData.consultationType === 'in-person'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('consultationType', e.target.value)}
              className="mr-2"
            />
            In Person
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          What would you like to discuss? *
        </label>
        <Textarea
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
          placeholder="Describe what you'd like to discuss during the consultation..."
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Urgency Level
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="urgent"
              checked={formData.urgency === 'urgent'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('urgency', e.target.value)}
              className="mr-2"
            />
            Urgent (24h)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="normal"
              checked={formData.urgency === 'normal'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('urgency', e.target.value)}
              className="mr-2"
            />
            Normal (2-3 days)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="flexible"
              checked={formData.urgency === 'flexible'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('urgency', e.target.value)}
              className="mr-2"
            />
            Flexible
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <Calendar className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Scheduling...' : 'Request Consultation'}
      </Button>

      <p className="text-xs text-slate-600 text-center">
        You'll receive a confirmation email with available time slots.
      </p>
    </form>
  );
};
