import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TableName } from '../types/schema';

/**
 * Configuration for the generic data fetcher hook.
 * @template T The type of the transformed data items.
 * @template R The final return type of the data property.
 */
export interface DataFetcherConfig<T, R> {
  tableName: TableName;
  query?: string;
  staticFallback: T[];
  transformData?: (data: Record<string, unknown>[]) => T[] | Promise<T[]>;
  postProcess?: (data: T[]) => R;
  enableRealtime?: boolean;
}

/**
 * Result object returned by the data fetcher hook.
 * @template R The final return type of the data property.
 */
export interface DataFetcherResult<R> {
  data: R;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * A generic hook for fetching data from Supabase with a static fallback.
 * This consolidates the common data fetching pattern used across multiple hooks.
 *
 * @param config The configuration object for the data fetcher.
 * @returns An object containing the fetched data, loading state, and error status.
 */
export const useDataFetcher = <T, R>({
  tableName,
  query = '*',
  staticFallback,
  transformData = (data: Record<string, unknown>[]) => data as unknown as T[],
  postProcess = (data) => data as unknown as R,
  enableRealtime = false,
}: DataFetcherConfig<T, R>): DataFetcherResult<R> => {
  const [data, setData] = useState<R>(postProcess(staticFallback));
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
        console.warn(`[DataFetcher] Database fetch failed for '${tableName}':`, dbError.message);
        console.log(`[DataFetcher] Using static fallback data for '${tableName}'.`);
        setData(postProcess(staticFallback));
      } else if (dbData && dbData.length > 0) {
        const transformed = await transformData(dbData as unknown as Record<string, unknown>[]);
        setData(postProcess(transformed));
      } else {
        console.log(`[DataFetcher] No data in '${tableName}', using static fallback.`);
        setData(postProcess(staticFallback));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(`[DataFetcher] Error fetching '${tableName}':`, errorMessage);
      setError(errorMessage);
      setData(postProcess(staticFallback));
    } finally {
      setLoading(false);
    }
  }, [tableName, query, staticFallback, transformData, postProcess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up realtime subscription if enabled
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log(`[DataFetcher] Realtime update for '${tableName}':`, payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, fetchData, enableRealtime]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
