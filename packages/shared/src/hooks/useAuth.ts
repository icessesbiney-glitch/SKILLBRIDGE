'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Defensive check to handle unconfigured or missing database client boundaries
    if (!supabase) {
      setError(new Error('Supabase client is uninitialized or missing configuration environment values.'));
      setLoading(false);
      return;
    }

    const getUser = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        setUser(user);
      } catch (err) {
        console.error('SkillBridge Authentication State Retrieval Failure:', err);
        setError(err instanceof Error ? err : new Error('Auth state synchronization error'));
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen continuously for real-time sign-in or sign-out ticks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}
