import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import type { Database } from '../types/database';

type TableNames = keyof Database['public']['Tables'];

export function useDatabase<T extends TableNames>(
  table: T,
  userId?: string
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize fetchData with useCallback to avoid infinite re-render loops in dependency arrays
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from(table).select('*');

      // Safely apply filtering parameters only if a user contextual state is present
      if (userId) {
        query = query.eq('user_id' as any, userId);
      }

      const { data: result, error: err } = await query;
      
      if (err) throw err;
      setData(result || []);
    } catch (err) {
      console.error(`Database operations execution failure on table [${table}]:`, err);
      setError(err instanceof Error ? err : new Error('Database connection ledger fault'));
    } finally {
      setLoading(false);
    }
  }, [table, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
