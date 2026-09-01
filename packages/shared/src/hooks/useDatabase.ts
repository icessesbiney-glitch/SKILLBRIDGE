import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Database } from '../types/database';

type TableNames = keyof Database['public']['Tables'];

export function useDatabase<T extends TableNames>(
  table: T,
  userId?: string
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from(table).select('*');

      if (userId) {
        // Type assertion needed because TypeScript doesn't know all tables have user_id
        query = (query as any).eq('user_id', userId);
      }

      const { data: result, error: err } = await query;
      if (err) throw err;
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Database error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table, userId]);

  return { data, loading, error, refetch: fetchData };
}
