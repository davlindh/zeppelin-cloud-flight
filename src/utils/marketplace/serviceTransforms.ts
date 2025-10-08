
import type { Service } from '@/types/marketplace/unified';
import type { DatabaseService } from '@/types/marketplace/serviceDatabase';

export const transformDatabaseService = (dbService: DatabaseService): Service => {
  console.log('Transforming database service:', dbService.id, 'Provider data:', dbService.service_providers);
  
  // Safely handle service_providers data - it might be null, undefined, or have errors
  const hasValidProviderData = dbService.service_providers && 
    typeof dbService.service_providers === 'object' && 
    'name' in dbService.service_providers;

  const providerDetails = hasValidProviderData ? {
    id: dbService.service_providers!.id ?? dbService.provider_id ?? `provider-${dbService.id}`,
    name: dbService.service_providers!.name,
    avatar: dbService.service_providers!.avatar ?? '',
    rating: dbService.service_providers!.rating ?? 4.5,
    reviews: dbService.service_providers!.reviews ?? 0,
    experience: dbService.service_providers!.experience ?? '5+ years',
    location: dbService.service_providers!.location ?? dbService.location,
    phone: dbService.service_providers!.phone ?? '',
    email: dbService.service_providers!.email ?? '',
    bio: dbService.service_providers!.bio ?? '',
    specialties: dbService.service_providers!.specialties ?? [],
    certifications: dbService.service_providers!.certifications ?? [],
    responseTime: dbService.service_providers!.response_time ?? '24 hours',
    completedProjects: dbService.service_providers!.completed_projects ?? 0,
    portfolio: [],
    recentReviews: []
  } : {
    // Fallback provider details when no provider data is available
    id: `provider-${dbService.id}`, // Generate a provider ID
    name: dbService.provider,
    avatar: '',
    rating: dbService.provider_rating ?? 4.5,
    reviews: 0,
    experience: '5+ years',
    location: dbService.location,
    phone: '',
    email: '',
    bio: `Professional ${dbService.category} service provider`,
    specialties: [dbService.category],
    certifications: [],
    responseTime: dbService.response_time ?? '24 hours',
    completedProjects: 0,
    portfolio: [],
    recentReviews: []
  };

  return {
    id: dbService.id,
    title: dbService.title,
    provider: dbService.provider,
    rating: dbService.rating,
    reviews: dbService.reviews,
    startingPrice: dbService.starting_price,
    duration: dbService.duration,
    category: dbService.category,
    location: dbService.location,
    available: dbService.available,
    image: dbService.image,
    description: dbService.description,
    features: dbService.features,
    images: dbService.images,
    providerDetails,
    availableTimes: dbService.available_times,
    providerRating: dbService.provider_rating ?? dbService.rating ?? 4.5,
    responseTime: dbService.response_time ?? '24 hours',
    slug: dbService.slug ?? undefined,
    created_at: dbService.created_at,
    updated_at: dbService.updated_at
  };
};
