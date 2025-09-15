import { QueryClient } from '@tanstack/react-query';

// Global query client configuration with optimal settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && 'status' in error) {
          const status = (error as Error & { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,

      // Don't refetch on reconnect by default (can be overridden per query)
      refetchOnReconnect: false,

      // Don't refetch on mount by default (can be overridden per query)
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,

      // Show optimistic updates by default
      onError: (error, variables, context) => {
        // Error handling can be customized per mutation
        console.error('Mutation error:', error);
      },
    },
  },
});

// Global error handler for queries
queryClient.getQueryCache().subscribe((event) => {
  // Handle different event types
  switch (event.type) {
    case 'added':
    case 'removed':
    case 'updated':
      // Query lifecycle events
      break;
    default:
      // Log any unexpected events for debugging
      console.debug('Query cache event:', event.type);
  }
});

// Export types for better type safety
export type QueryClientType = typeof queryClient;
