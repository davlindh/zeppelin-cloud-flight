// Transform functions to convert database types to application types
import { getImageUrl } from './imageUtils';
import type { DatabaseProduct, DatabaseAuction, DatabaseService, DatabaseServiceProvider } from '@/types/database';
import type { Product, Auction, Service, ServiceProvider } from '@/types/unified';

export const transformProduct = (dbProduct: DatabaseProduct): Product => ({
  id: dbProduct.id,
  title: dbProduct.title,
  description: dbProduct.description,
  price: dbProduct.selling_price,
  originalPrice: dbProduct.original_price,
  categoryId: dbProduct.category_id || ',
  categoryName: dbProduct.category?.display_name || dbProduct.category?.name || 'General',
  rating: dbProduct.rating || 0,
  reviews: dbProduct.reviews || 0,
  inStock: dbProduct.in_stock,
  image: getImageUrl(dbProduct.image), // Transform nullable to non-null
  images: dbProduct.images?.filter(img => img && img !== ') || [],
  variants: [], // Will be populated separately if needed
  features: dbProduct.features || [],
  brand: dbProduct.product_brand || '',
  tags: dbProduct.tags || [],
  slug: dbProduct.slug,
  created_at: dbProduct.created_at,
  updated_at: dbProduct.updated_at,
});

export const transformAuction = (dbAuction: DatabaseAuction): Auction => ({
  id: dbAuction.id,
  title: dbAuction.title,
  currentBid: dbAuction.current_bid,
  startingBid: dbAuction.starting_bid,
  endTime: new Date(dbAuction.end_time),
  bidders: dbAuction.bidders,
  category: dbAuction.category,
  condition: dbAuction.condition,
  image: getImageUrl(dbAuction.image), // Transform nullable to non-null
  slug: dbAuction.slug,
  created_at: dbAuction.created_at,
  updated_at: dbAuction.updated_at,
});

export const transformServiceProvider = (dbProvider: DatabaseServiceProvider): ServiceProvider => ({
  id: dbProvider.id,
  name: dbProvider.name,
  avatar: getImageUrl(dbProvider.avatar), // Transform nullable to non-null
  rating: dbProvider.rating || 0,
  reviews: dbProvider.reviews || 0,
  experience: dbProvider.experience,
  location: dbProvider.location,
  phone: dbProvider.phone ?? ',
  email: dbProvider.email ?? '',
  bio: dbProvider.bio ?? ',
  specialties: dbProvider.specialties ?? undefined,
  certifications: dbProvider.certifications ?? undefined,
  responseTime: dbProvider.response_time ?? undefined,
  completedProjects: dbProvider.completed_projects ?? undefined,
  created_at: dbProvider.created_at,
  updated_at: dbProvider.updated_at,
});

export const transformService = (dbService: DatabaseService, providerDetails?: ServiceProvider): Service => ({
  id: dbService.id,
  title: dbService.title,
  provider: dbService.provider,
  rating: dbService.rating || 0,
  reviews: dbService.reviews || 0,
  startingPrice: dbService.starting_price,
  duration: dbService.duration,
  category: dbService.category,
  location: dbService.location,
  available: dbService.available,
  image: getImageUrl(dbService.image), // Transform nullable to non-null
  images: dbService.images?.filter(img => img && img !== '') || [],
  description: dbService.description,
  features: dbService.features || [],
  availableTimes: dbService.available_times || [],
  providerRating: dbService.provider_rating,
  responseTime: dbService.response_time,
  slug: dbService.slug,
  providerDetails: providerDetails || {
    id: ',
    name: dbService.provider,
    avatar: getImageUrl(null),
    rating: 0,
    reviews: 0,
    experience: '',
    location: dbService.location,
    phone: ',
    email: '',
    bio: ',
  },
  created_at: dbService.created_at,
  updated_at: dbService.updated_at,
});

// Helper functions for null-safe transformations
export const transformNullableImage = (image: string | null | undefined): string => {
  return getImageUrl(image);
};

export const transformNullableImageArray = (images: (string | null)[] | null | undefined): string[] => {
  if (!images) return [];
  return images.filter((img): img is string => img !== null && img !== '');
};