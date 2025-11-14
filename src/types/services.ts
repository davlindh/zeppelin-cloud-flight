import type { Service } from './unified';

export type PricingModel = 'fixed' | 'hourly' | 'per_project' | 'custom';

export interface EventAvailability {
  event_id: string;
  event_title?: string;
  available: boolean;
  custom_price?: number;
  notes?: string;
}

export interface ServiceExtended extends Service {
  tags: string[];
  pricing_model: PricingModel;
  hourly_rate?: number;
  project_rate_min?: number;
  project_rate_max?: number;
  event_availability: EventAvailability[];
}

export type BookingStatus = 
  | 'request'
  | 'pending'
  | 'pending_provider'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface ProposedTime {
  date: string;
  time: string;
  note?: string;
}

export interface BookingExtended {
  id: string;
  service_id: string;
  user_id?: string;
  event_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_message: string;
  selected_date: string;
  selected_time: string;
  customizations: Record<string, any>;
  status: BookingStatus;
  total_price?: number;
  provider_notes?: string;
  proposed_times?: ProposedTime[];
  provider_response?: string;
  created_at: string;
  updated_at: string;
  service?: {
    title: string;
    starting_price: number;
    duration: string;
    provider: string;
    provider_id?: string;
  };
}
