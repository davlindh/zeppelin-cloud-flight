
export interface DatabaseService {
  id: string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  starting_price: number;
  duration: string;
  category: string; // Database stores as string, not enum
  location: string;
  available: boolean;
  image: string | null;
  description: string;
  features: string[];
  images: string[];
  available_times: string[];
  provider_rating?: number | null;
  response_time?: string | null;
  slug?: string | null;
  created_at: string;
  updated_at: string;
  provider_id?: string | null;
  // Updated to handle Supabase's actual response structure
  service_providers?: {
    id: string;
    name: string;
    avatar: string | null;
    rating: number;
    reviews: number;
    experience: string;
    location: string;
    phone: string;
    email: string;
    bio: string;
    specialties: string[] | null;
    certifications: string[] | null;
    response_time: string | null;
    completed_projects: number | null;
  } | null;
}

export interface ServiceFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  search?: string;
}
