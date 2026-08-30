import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

export type SupabaseConfig = {
  url: string;
  key: string;
};

export function resolveSupabaseConfig(env: SupabaseEnv): SupabaseConfig | null {
  const url = env.VITE_SUPABASE_URL?.trim();
  const key = (env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY)?.trim();

  return url && key ? { url, key } : null;
}

const config = resolveSupabaseConfig(import.meta.env as SupabaseEnv);

/** Null keeps local review and tests working until the project env is configured. */
export const supabase: SupabaseClient | null = config
  ? createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = config !== null;
