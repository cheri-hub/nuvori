import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../lib/supabase';
import { getCurrentUser, requestMagicLink, signOut, subscribeToAuthChanges } from '../services/authService';

type AuthHookState = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  error?: string;
  requestMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useSupabaseAuth(): AuthHookState {
  const configured = isSupabaseConfigured;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!configured) return undefined;
    let mounted = true;
    getCurrentUser()
      .then((currentUser) => { if (mounted) setUser(currentUser); })
      .catch((authError) => { if (mounted) setError(errorMessage(authError, 'Nao foi possivel abrir sua sessao.')); })
      .finally(() => { if (mounted) setLoading(false); });
    const unsubscribe = subscribeToAuthChanges(({ session }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [configured]);

  const sendMagicLink = useCallback(async (email: string) => {
    setError(undefined);
    try {
      await requestMagicLink(email);
    } catch (authError) {
      const message = errorMessage(authError, 'Nao foi possivel enviar o link.');
      setError(message);
      throw authError;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(undefined);
    try {
      await signOut();
      setUser(null);
    } catch (authError) {
      setError(errorMessage(authError, 'Nao foi possivel sair agora.'));
      throw authError;
    }
  }, []);

  return { user, loading, configured, error, requestMagicLink: sendMagicLink, signOut: logout };
}
