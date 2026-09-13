'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../utils/supabaseClient';

type AuthSessionState = {
  isConfigured: boolean;
  isLoading: boolean;
  session: Session | null;
};

export function useAuthSession(): AuthSessionState {
  const [state, setState] = useState<AuthSessionState>({
    isConfigured: Boolean(supabase),
    isLoading: Boolean(supabase),
    session: null,
  });

  useEffect(() => {
    if (!supabase) {
      setState({
        isConfigured: false,
        isLoading: false,
        session: null,
      });
      return undefined;
    }

    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setState({
        isConfigured: true,
        isLoading: false,
        session: data.session,
      });
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      setState({
        isConfigured: true,
        isLoading: false,
        session,
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
