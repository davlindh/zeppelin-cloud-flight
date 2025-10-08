
// Unified type definitions with consistent string IDs and strict typing

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  size?: string;
  color?: string;
  material?: string;
  stock: number;
}

export interface Product extends BaseEntity {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  categoryName: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  image: string | null;
  images: string[];
  variants: ProductVariant[];
  features: string[];
  brand: string;
  tags: string[];
  slug?: string;
}

export interface BidHistory {
  bidder: string;
  amount: number;
  time: string;
}

export interface Auction extends BaseEntity {
  title: string;
  currentBid: number;
  startingBid: number;
  endTime: Date;
  bidders: number;
  category: string;
  condition: string;
  image: string | null;
  bidHistory?: BidHistory[]; // Made optional for listing page
  slug?: string;
}

export interface ServicePortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

export interface ServiceReview {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface ServiceProvider extends BaseEntity {
  name: string;
  avatar: string | null;
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  phone: string;
  email: string;
  bio: string;
  specialties?: string[];
  certifications?: string[];
  responseTime?: string;
  completedProjects?: number;
  portfolio?: ServicePortfolioItem[];
  recentReviews?: ServiceReview[];
}

export interface Service extends BaseEntity {
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  duration: string;
  category: string; // Changed from enum to string for database compatibility
  location: string;
  available: boolean;
  image: string | null;
  description: string;
  features: string[];
  images: string[];
  providerDetails: ServiceProvider;
  availableTimes: string[];
  providerRating?: number;
  responseTime?: string;
  slug?: string;
  customizationOptions?: {
    name: string;
    type: 'select' | 'input' | 'textarea';
    options?: string[];
    required: boolean;
    description?: string;
  }[];
}

// Updated booking types with string IDs
export interface BookingData {
  selectedDate: string;
  selectedTime: string;
  customizations: Record<string, string>;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    message: string;
  };
  agreedToTerms: boolean;
}

export interface ServiceForBooking {
  id: string;
  title: string;
  startingPrice: number;
  duration: string;
  provider: string;
  providerEmail: string;
  customizationOptions?: {
    name: string;
    type: 'select' | 'input' | 'textarea';
    options?: string[];
    required: boolean;
    description?: string;
  }[];
}

export interface EnhancedServiceBookingCardProps {
  service: ServiceForBooking;
  availableTimes: string[];
  onBooking: (bookingData: BookingData) => void;
}

// Updated communication types with string IDs
export interface CommunicationRequest {
  id: string;
  type: 'message' | 'consultation' | 'quote';
  referenceNumber: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'responded' | 'completed';
  
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  
  providerId: string;
  providerName: string;
  providerEmail: string;
  
  serviceContext?: {
    serviceId?: string; // Changed from number to string
    serviceName?: string;
    servicePrice?: number;
  };
  
  subject?: string;
  message: string;
  additionalData?: Record<string, any>;
  
  providerResponse?: string;
  responseTimestamp?: Date;
  estimatedResponseTime?: string;
}

export interface NotificationTemplate {
  type: 'customer_confirmation' | 'provider_notification' | 'status_update';
  subject: string;
  htmlContent: string;
  textContent: string;
}
