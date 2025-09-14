import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

export interface DataFetcherConfig<T, R> {
  tableName: TableName;
  staticFallback: T[];
  transformData?: (data: any[]) => T[];
  postProcess?: (data: T[]) => R;
  enableRealtime?: boolean;
}

export interface DataFetcherResult<R> {
  data: R;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching data with database/static fallback pattern
 * Consolidates the common pattern used across all entity data hooks
 */
export const useDataFetcher = <T = any, R = T[]>({
  tableName,
  staticFallback,
  transformData = (data) => data as T[],
  postProcess = (data) => data as unknown as R,
  enableRealtime = false
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
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.warn(`Database fetch failed for ${tableName}:`, dbError);
        console.log(`Using static fallback data for ${tableName}`);
        setData(postProcess(staticFallback));
      } else if (dbData && dbData.length > 0) {
        const transformed = transformData(dbData);
        setData(postProcess(transformed));
      } else {
        console.log(`No data found in ${tableName}, using static fallback`);
        setData(postProcess(staticFallback));
      }
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData(postProcess(staticFallback));
    } finally {
      setLoading(false);
    }
  }, [tableName, staticFallback, transformData, postProcess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up realtime subscription if enabled
  useEffect(() => {
    if (!enableRealtime) return;

    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName 
        }, 
        () => {
          console.log(`Realtime update detected for ${tableName}`);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, fetchData, enableRealtime]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

/**
 * Enhanced version with relationship loading
 */
export const useEnhancedDataFetcher = <T = any, R = T[]>({
  tableName,
  staticFallback,
  transformData = (data) => data as T[],
  postProcess = (data) => data as unknown as R,
  enableRealtime = false,
  relationships = []
}: DataFetcherConfig<T, R> & {
  relationships?: TableName[];
}): DataFetcherResult<R> & {
  relationshipData: Record<string, any[]>;
} => {
  const [relationshipData, setRelationshipData] = useState<Record<string, any[]>>({});
  
  const baseResult = useDataFetcher({
    tableName,
    staticFallback,
    transformData,
    postProcess,
    enableRealtime
  });

  const fetchRelationships = useCallback(async () => {
    if (relationships.length === 0) return;

    const relationshipPromises = relationships.map(async (relationTable) => {
      try {
        const { data, error } = await supabase
          .from(relationTable)
          .select('*');

        return { table: relationTable, data: data || [], error };
      } catch (err) {
        console.error(`Error fetching ${relationTable}:`, err);
        return { table: relationTable, data: [], error: err };
      }
    });

    const results = await Promise.all(relationshipPromises);
    const relationshipMap: Record<string, any[]> = {};
    
    results.forEach(({ table, data }) => {
      relationshipMap[table] = data;
    });

    setRelationshipData(relationshipMap);
  }, [relationships]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  return {
    ...baseResult,
    relationshipData
  };
};