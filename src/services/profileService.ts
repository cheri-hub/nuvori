import type { SupabaseClient, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type ProfileClient = Pick<SupabaseClient, 'from'>;

export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

const defaultClient = supabase as unknown as ProfileClient | null;

function profileName(user: Pick<User, 'email' | 'user_metadata'>): string {
  const metadata = user.user_metadata ?? {};
  const candidate = metadata.display_name ?? metadata.full_name ?? metadata.name;
  if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  return user.email?.split('@')[0] || 'Nuvori';
}

export async function ensureProfile(user: Pick<User, 'id' | 'email' | 'user_metadata'>, client: ProfileClient | null = defaultClient): Promise<void> {
  if (!client) throw new ProfileError('Supabase nao esta configurado.');
  const metadata = user.user_metadata ?? {};
  const avatar = metadata.avatar_url;
  const payload: { id: string; display_name: string; avatar_url?: string } = {
    id: user.id,
    display_name: profileName(user),
  };
  if (typeof avatar === 'string' && avatar.trim()) payload.avatar_url = avatar.trim();
  const { error } = await client.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) throw new ProfileError(error.message);
}
