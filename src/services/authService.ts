import type { AuthChangeEvent, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AuthClient = Pick<SupabaseClient, 'auth'>;
export type AuthStateChange = { event: AuthChangeEvent; session: Session | null };

export class AuthInputError extends Error {
  constructor(message = 'Digite um email valido.') {
    super(message);
    this.name = 'AuthInputError';
  }
}

export class AuthUnavailableError extends Error {
  constructor(message = 'A autenticacao ainda nao esta configurada.') {
    super(message);
    this.name = 'AuthUnavailableError';
  }
}

function requireClient(client: AuthClient | null): AuthClient {
  if (!client) throw new AuthUnavailableError();
  return client;
}

export async function requestMagicLink(email: string, client: AuthClient | null = supabase): Promise<void> {
  const normalizedEmail = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new AuthInputError();

  const authClient = requireClient(client);
  const { error } = await authClient.auth.signInWithOtp({
    email: normalizedEmail,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function getCurrentUser(client: AuthClient | null = supabase): Promise<User | null> {
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session?.user ?? null;
}

export function subscribeToAuthChanges(onChange: (state: AuthStateChange) => void, client: AuthClient | null = supabase): () => void {
  if (!client) return () => undefined;
  const { data } = client.auth.onAuthStateChange((event, session) => onChange({ event, session }));
  return () => data.subscription.unsubscribe();
}

export async function signOut(client: AuthClient | null = supabase): Promise<void> {
  const authClient = requireClient(client);
  const { error } = await authClient.auth.signOut();
  if (error) throw error;
}
