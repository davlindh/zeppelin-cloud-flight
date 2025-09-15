import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TableName } from '../types/schema';
import { errorHandler } from '../utils/errorHandler';

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
        setData(postProcess(staticFallback));
      } else if (dbData && dbData.length > 0) {
        const transformed = await transformData(dbData as unknown as Record<string, unknown>[]);
        setData(postProcess(transformed));
      } else {
        setData(postProcess(staticFallback));
      }
    } catch (err) {
      const result = errorHandler.handleError(err, {
        component: 'DataFetcher',
        action: `fetching data from ${tableName}`,
        technicalDetails: { tableName, query }
      });
      setError(result.userMessage);
      setData(postProcess(staticFallback));
    } finally {
      setLoading(false);
    }
  }, [tableName, query, staticFallback, transformData, postProcess]);

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
