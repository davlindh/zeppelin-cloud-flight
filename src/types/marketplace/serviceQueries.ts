
// Enhanced service query types with proper assertions

import type { Service } from './unified';
import type { DatabaseService } from './serviceDatabase';

export interface ServiceQueryParams {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'reviews' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceQuery {
  data: Service[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}

export interface ServiceDetailQuery {
  data: Service | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface ServiceFiltersState {
  category: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  availableOnly: boolean;
  search: string;
  sortBy: 'price' | 'rating' | 'reviews' | 'date';
  sortOrder: 'asc' | 'desc';
}

export interface ServiceApiResponse {
  services: DatabaseService[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

// Type guards for service queries
export const isValidServiceQueryParams = (params: unknown): params is ServiceQueryParams => {
  if (!params || typeof params !== 'object') return false;
  
  const p = params as Record<string, unknown>;
  
  return (
    (!p.category || typeof p.category === 'string') &&
    (!p.location || typeof p.location === 'string') &&
    (!p.minPrice || typeof p.minPrice === 'number') &&
    (!p.maxPrice || typeof p.maxPrice === 'number') &&
    (!p.availableOnly || typeof p.availableOnly === 'boolean') &&
    (!p.search || typeof p.search === 'string') &&
    (!p.page || typeof p.page === 'number') &&
    (!p.limit || typeof p.limit === 'number')
  );
};

export const isDatabaseService = (data: unknown): data is DatabaseService => {
  if (!data || typeof data !== 'object') return false;
  
  const service = data as Record<string, unknown>;
  
  return (
    typeof service.id === 'string' &&
    typeof service.title === 'string' &&
    typeof service.provider === 'string' &&
    typeof service.starting_price === 'number' &&
    typeof service.category === 'string'
  );
};
