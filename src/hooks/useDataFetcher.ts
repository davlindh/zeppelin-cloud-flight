import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TableName } from '../types/schema';
import { errorHandler } from '../utils/errorHandler';

/**
 * Configuration for the generic data fetcher hook.
 * @template T The type of the transformed data items.
 * @template R The final return type of the data property.
 *
 * @deprecated This hook uses static fallbacks and raw Supabase queries.
 * Please use TanStack Query hooks from @/hooks/useApi instead.
 */
export interface DataFetcherConfig<T, R> {
  tableName: TableName;
  query?: string;
  staticFallback: T[]; // @deprecated - Remove this parameter
  transformData?: (data: Record<string, unknown>[]) => T[] | Promise<T[]>;
  postProcess?: (data: T[]) => R;
  enableRealtime?: boolean;
}

/**
 * Result object returned by the data fetcher hook.
 * @template R The final return type of the data property.
 * @deprecated Use TanStack Query results instead.
 */
export interface DataFetcherResult<R> {
  data: R;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * @deprecated This hook is deprecated and should be replaced with TanStack Query hooks.
 *
 * **Migration Guide:**
 * 1. Remove staticFallback parameter - rely on TanStack Query's caching
 * 2. Use `staleTime` and `gcTime` for offline behavior instead of static fallbacks
 * 3. Use hooks from @/hooks/useApi for consistent data fetching
 *
 * **Example Migration:**
 * OLD: useDataFetcher({ tableName: 'participants', staticFallback: [] })
 * NEW: useParticipants() // From @/hooks/useApi with proper caching
 */
export const useDataFetcher = <T, R>({
  tableName,
  query = '*',
  staticFallback,
  transformData = (data: Record<string, unknown>[]) => data as unknown as T[],
  postProcess = (data) => data as unknown as R,
  enableRealtime = false,
}: DataFetcherConfig<T, R>): DataFetcherResult<R> => {
  // Log deprecation warning
  console.warn(
    `useDataFetcher is deprecated. Please migrate to TanStack Query hooks.\n` +
    `Table: ${tableName}\n` +
    `See: @/hooks/useApi for replacement hooks.`
  );

  const [data, setData] = useState<R>(() => {
    // Initialize with empty data - no more static fallbacks
    return postProcess([]);
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: dbData, error: dbError } = await supabase
        .from(tableName)
        .select(query)
        .order('created_at', { ascending: false });

      if (dbError) {
        throw dbError;
      } else if (dbData) {
        const transformed = await transformData(dbData as unknown as Record<string, unknown>[]);
        setData(postProcess(transformed));
      } else {
        // Return empty array instead of static fallback
        setData(postProcess([]));
      }
    } catch (err) {
      const result = errorHandler.handleError(err, {
        component: 'DataFetcher',
        action: `fetching data from ${tableName}`,
        technicalDetails: { tableName, query }
      });
      setError(result.userMessage);
      // Return empty array instead of static fallback
      setData(postProcess([]));
    } finally {
      setLoading(false);
    }
  }, [tableName, query, transformData, postProcess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enableRealtime) return;
    const channel = supabase.channel(`${tableName}_changes`);
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      () => {
        fetchData();
      }
    );
    // Subscribe without returning the subscribe promise
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, fetchData, enableRealtime]);

  return { data, loading, error, refetch: fetchData };
};
