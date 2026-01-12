import { QueryClient } from '@tanstack/react-query';

type HttpStatusError = Error & { status?: number; response?: Response };

const isClientErrorStatus = (error: unknown): error is HttpStatusError => {
  if (!error || typeof error !== 'object') return false;

  const status = (error as HttpStatusError).status ?? (error as HttpStatusError).response?.status;

  return typeof status === 'number' && status >= 400 && status < 500;
};

// Global query client configuration with 30-second fresh data window
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 30 seconds - won't refetch if accessed within this window
      staleTime: 30 * 1000, // 30 seconds
      // Keep data in cache for 5 minutes after last use
      gcTime: 5 * 60 * 1000, // 5 minutes

      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (isClientErrorStatus(error)) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Exponential backoff between retries, capped at 5 seconds
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5_000),

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
  // Surface query errors so they can be correlated with API/database issues
  if (event?.type === 'updated' && event.query.state.status === 'error') {
    console.error('Query error:', event.query.queryKey, event.query.state.error);
    return;
  }

  // Log unexpected events for debugging
  if (!['added', 'removed', 'updated', 'observerResultsUpdated'].includes(event.type)) {
    console.debug('Query cache event:', event.type);
  }
});

// Global error handler for mutations (often writes to the database)
queryClient.getMutationCache().subscribe((event) => {
  if (event?.type === 'updated' && event.mutation.state.status === 'error') {
    console.error('Mutation error:', event.mutation.options.mutationKey, event.mutation.state.error);
  }
});

// Export types for better type safety
export type QueryClientType = typeof queryClient;
