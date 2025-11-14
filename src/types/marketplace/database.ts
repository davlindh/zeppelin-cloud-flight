// Database types (what comes from Supabase - nullable images)
export interface DatabaseProduct {
  id: string;
  title: string;
  description: string;
  selling_price: number;
  original_price?: number;
  category_id?: string;
  rating: number;
  reviews: number;
  in_stock: boolean;
  image: string | null; // Nullable from database
  images: string[];
  features: string[] | null;
  product_brand?: string;
  tags: string[] | null;
  slug?: string;
  created_at: string;
  updated_at: string;
  // For joined category data
  category?: {
    name: string;
    display_name: string;
  };
}

export interface DatabaseAuction {
  id: string;
  title: string;
  current_bid: number;
  starting_bid: number;
  end_time: string;
  bidders: number;
  category: string;
  condition: string;
  image: string | null; // Nullable from database
  images: string[];
  slug?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseService {
  id: string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  starting_price: number;
  duration: string;
  category: string;
  location: string;
  available: boolean;
  image: string | null; // Nullable from database
  images: string[];
  description: string;
  features: string[];
  available_times: string[];
  provider_rating?: number;
  response_time?: string;
  slug?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseServiceProvider {
  id: string;
  name: string;
  avatar: string | null; // Nullable from database
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  phone: string | null;
  email: string | null;
  bio: string | null;
  specialties?: string[] | null;
  certifications?: string[] | null;
  response_time?: string | null;
  completed_projects?: number | null;
  slug?: string | null;
  years_in_business?: number | null;
  awards?: string[] | null;
  work_philosophy?: string | null;
  portfolio_description?: string | null;
  created_at: string;
  updated_at: string;
}