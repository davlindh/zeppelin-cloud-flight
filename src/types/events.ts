export type EventStatus = "draft" | "published" | "archived";

export interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  venue?: string | null;
  location?: string | null;
  starts_at: string;
  ends_at: string;
  capacity: number;
  status: EventStatus;
  is_featured: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type EventRegistrationStatus =
  | "pending"
  | "confirmed"
  | "waitlist"
  | "cancelled";

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: EventRegistrationStatus;
  note?: string | null;
  checked_in_at?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  created_at: string;
}

export interface EventRegistrationWithUser extends EventRegistration {
  user?: {
    id: string;
    email?: string;
    full_name?: string;
  };
}

export interface EventStats {
  total_capacity: number;
  total_registrations: number;
  confirmed_count: number;
  pending_count: number;
  waitlisted_count: number;
  cancelled_count: number;
  checked_in_count: number;
  no_show_count: number;
  available_spots: number;
}

export interface EventWithRegistrationCount extends Event {
  registration_count?: number;
  is_registered?: boolean;
  user_registration_status?: EventRegistrationStatus;
}
