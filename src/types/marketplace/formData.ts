
// Proper form data interfaces replacing any types

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  agreedToTerms: boolean;
}

export interface BookingFormData {
  selectedDate: string;
  selectedTime: string;
  customizations: Record<string, string>;
  contactInfo: ContactFormData;
  specialRequests?: string;
}

export interface ServiceCustomizationOption {
  name: string;
  type: 'select' | 'input' | 'textarea' | 'checkbox';
  options?: string[];
  required: boolean;
  description?: string;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
}

export interface BidFormData {
  email: string;
  name: string;
  amount: number;
  agreedToTerms: boolean;
  phoneNumber?: string;
}

export interface SearchFormData {
  query: string;
  category?: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'relevance' | 'price' | 'date' | 'rating';
  filters?: Record<string, string | number | boolean>;
}

export interface CommunicationFormData {
  type: 'message' | 'consultation' | 'quote';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject?: string;
  message: string;
  serviceId?: string;
  preferredContactMethod?: 'email' | 'phone';
  urgency?: 'low' | 'medium' | 'high';
}
