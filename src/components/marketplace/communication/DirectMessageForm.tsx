
import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCommunicationTracking } from '@/hooks/useCommunicationTracking';
import { useCustomerInfo } from '@/hooks/useCustomerInfo';

interface DirectMessageFormProps {
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

export const DirectMessageForm: React.FC<DirectMessageFormProps> = ({
  providerId: _providerId,
  providerName: _providerName,
  providerEmail: _providerEmail,
  serviceContext,
  onSubmit
}) => {
  const { submitCommunicationRequest } = useCommunicationTracking();
  const { customerInfo, saveCustomerInfo } = useCustomerInfo();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: ',
    customerEmail: '',
    customerPhone: ',
    subject: serviceContext?.serviceName ? `Question about ${serviceContext.serviceName}` : '',
    message: ',
    preferredContact: 'email' as 'email' | 'phone'
  });

  useEffect(() => {
    // Auto-fill from customer info
    setFormData(prev => ({
      ...prev,
      customerName: customerInfo.name || ',
      customerEmail: customerInfo.email || '',
      customerPhone: customerInfo.phone || '
    }));
  }, [customerInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitCommunicationRequest('message', {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        providerId: _providerId,
        providerName: _providerName,
        providerEmail: _providerEmail,
        serviceContext,
        subject: formData.subject,
        message: formData.message,
        additionalData: {
          preferredContact: formData.preferredContact
        }
      });
      
      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Save customer info for future use
    if (field === 'customerName') saveCustomerInfo({ name: value });
    if (field === 'customerEmail') saveCustomerInfo({ email: value });
    if (field === 'customerPhone') saveCustomerInfo({ phone: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your Name *
          </label>
          <Input
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
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
            value={formData.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
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
          value={formData.customerPhone}
          onChange={(e) => handleChange('customerPhone', e.target.value)}
          placeholder="Your phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Subject
        </label>
        <Input
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          placeholder="What's this about?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Message *
        </label>
        <Textarea
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Type your message here..."
          rows={4}
          required
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
        <Send className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>

      <p className="text-xs text-slate-600 text-center">
        You'll receive an instant confirmation with a reference number for tracking.
      </p>
    </form>
  );
};
