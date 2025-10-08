import { Service } from '@/types/unified';

// Default empty services array as fallback
const defaultServices: Service[] = [];

export { type Service } from '@/types/unified';

/**
 * Service utility functions that provide an abstraction layer over data fetching.
 * These functions can work with both Supabase data (via hooks) and mock data as fallback.
 * 
 * Note: These functions are synchronous and work with pre-fetched data.
 * For real-time data fetching, use the hooks directly:
 * - useServices() for fetching services
 * - useServiceProviders() for fetching providers
 * - useService(id) for fetching single service
 */

export function getEnhancedServiceData(serviceId: string, services?: Service[]): Service | null {
  const dataSource = services ?? defaultServices;
  const service = dataSource.find((service: Service) => service.id === serviceId);
  if (!service) {
    console.warn(`Service with ID ${serviceId} not found`);
    return null;
  }
  return service;
}

export function getAllServices(services?: Service[]): Service[] {
  return services ?? defaultServices;
}

export function getServicesByCategory(category: string, services?: Service[]): Service[] {
  const dataSource = services ?? defaultServices;
  if (category === 'all') return dataSource;
  return dataSource.filter((service: Service) => service.category === category);
}

export function getServicesByProvider(providerName: string, services?: Service[]): Service[] {
  const dataSource = services ?? defaultServices;
  return dataSource.filter((service: Service) => 
    service.provider.toLowerCase() === providerName.toLowerCase()
  );
}

export function getProviderByName(providerName: string, services?: Service[]): Service['providerDetails'] | null {
  const dataSource = services ?? defaultServices;
  const service = dataSource.find((service: Service) => 
    service.provider.toLowerCase() === providerName.toLowerCase()
  );
  return service?.providerDetails ?? null;
}

export function getProviderBySlug(slug: string, services?: Service[]): Service['providerDetails'] | null {
  const providerName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return getProviderByName(providerName, services);
}

export function getAvailableServices(services?: Service[]): Service[] {
  const dataSource = services ?? defaultServices;
  return dataSource.filter((service: Service) => service.available);
}

export function getFeaturedServices(count: number = 3, services?: Service[]): Service[] {
  return getAvailableServices(services).slice(0, count);
}

export function searchServices(query: string, services?: Service[]): Service[] {
  const dataSource = services ?? defaultServices;
  const lowerQuery = query.toLowerCase();
  return dataSource.filter((service: Service) => 
    service.title.toLowerCase().includes(lowerQuery) ||
    service.provider.toLowerCase().includes(lowerQuery) ||
    service.category.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery)
  );
}

export function getServiceCategories(services?: Service[]): string[] {
  const dataSource = services ?? defaultServices;
  const categories = new Set(dataSource.map((service: Service) => service.category));
  return Array.from(categories);
}

export function sortServices(services: Service[], sortBy: string): Service[] {
  const sortedServices = [...services];
  
  switch (sortBy) {
    case 'price-low':
      return sortedServices.sort((a, b) => a.startingPrice - b.startingPrice);
    case 'price-high':
      return sortedServices.sort((a, b) => b.startingPrice - a.startingPrice);
    case 'rating':
      return sortedServices.sort((a, b) => b.rating - a.rating);
    case 'name':
      return sortedServices.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sortedServices.sort((a, b) => b.rating - a.rating);
  }
}

/**
 * React Hook integration helpers
 * These functions help integrate with the React hooks for live data
 */

export function createServiceUtilsWithData(services: Service[]) {
  return {
    getEnhancedServiceData: (serviceId: string) => getEnhancedServiceData(serviceId, services),
    getAllServices: () => getAllServices(services),
    getServicesByCategory: (category: string) => getServicesByCategory(category, services),
    getServicesByProvider: (providerName: string) => getServicesByProvider(providerName, services),
    getProviderByName: (providerName: string) => getProviderByName(providerName, services),
    getProviderBySlug: (slug: string) => getProviderBySlug(slug, services),
    getAvailableServices: () => getAvailableServices(services),
    getFeaturedServices: (count?: number) => getFeaturedServices(count, services),
    searchServices: (query: string) => searchServices(query, services),
    getServiceCategories: () => getServiceCategories(services),
    sortServices: (sortBy: string) => sortServices(services, sortBy)
  };
}
