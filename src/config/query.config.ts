// Centralized React Query configuration for consistent timing across the app

export const QUERY_STALE_TIME = {
  // Real-time data (auctions, live updates)
  REALTIME: 1000, // 1 second
  
  // Fast-changing data (notifications, counts)
  FAST: 30 * 1000, // 30 seconds
  
  // Standard data (most content)
  STANDARD: 2 * 60 * 1000, // 2 minutes
  
  // Stable data (categories, providers)
  STABLE: 5 * 60 * 1000, // 5 minutes
  
  // Static data (rarely changes)
  STATIC: 10 * 60 * 1000, // 10 minutes
} as const;

export const QUERY_GC_TIME = {
  SHORT: 2 * 60 * 1000, // 2 minutes
  STANDARD: 5 * 60 * 1000, // 5 minutes
  LONG: 10 * 60 * 1000, // 10 minutes
  EXTENDED: 30 * 60 * 1000, // 30 minutes
} as const;

export const QUERY_REFETCH_INTERVAL = {
  LIVE: 5 * 1000, // 5 seconds (auctions)
  FREQUENT: 30 * 1000, // 30 seconds (notifications)
  REGULAR: 60 * 1000, // 1 minute (counts)
  SLOW: 5 * 60 * 1000, // 5 minutes (dashboard)
  DISABLED: false,
} as const;

export const QUERY_RETRY = {
  DISABLED: 0,
  MINIMAL: 1,
  STANDARD: 2,
  AGGRESSIVE: 3,
} as const;

// Common query options for different data types
export const getQueryOptions = (type: 'realtime' | 'fast' | 'standard' | 'stable' | 'static') => {
  const baseOptions = {
    retry: QUERY_RETRY.STANDARD,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  };

  switch (type) {
    case 'realtime':
      return {
        ...baseOptions,
        staleTime: QUERY_STALE_TIME.REALTIME,
        gcTime: QUERY_GC_TIME.SHORT,
        refetchInterval: QUERY_REFETCH_INTERVAL.LIVE,
      };
    case 'fast':
      return {
        ...baseOptions,
        staleTime: QUERY_STALE_TIME.FAST,
        gcTime: QUERY_GC_TIME.SHORT,
        refetchInterval: QUERY_REFETCH_INTERVAL.FREQUENT,
      };
    case 'standard':
      return {
        ...baseOptions,
        staleTime: QUERY_STALE_TIME.STANDARD,
        gcTime: QUERY_GC_TIME.STANDARD,
        refetchInterval: QUERY_REFETCH_INTERVAL.DISABLED,
      };
    case 'stable':
      return {
        ...baseOptions,
        staleTime: QUERY_STALE_TIME.STABLE,
        gcTime: QUERY_GC_TIME.LONG,
        refetchInterval: QUERY_REFETCH_INTERVAL.DISABLED,
      };
    case 'static':
      return {
        ...baseOptions,
        staleTime: QUERY_STALE_TIME.STATIC,
        gcTime: QUERY_GC_TIME.EXTENDED,
        refetchInterval: QUERY_REFETCH_INTERVAL.DISABLED,
        refetchOnWindowFocus: false,
      };
    default:
      return baseOptions;
  }
};