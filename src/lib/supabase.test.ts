import { describe, expect, it } from 'vitest';
import { resolveSupabaseConfig } from './supabase';

describe('resolveSupabaseConfig', () => {
  it('accepts the publishable key used by a Supabase project', () => {
    expect(resolveSupabaseConfig({
      VITE_SUPABASE_URL: 'https://project.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    })).toEqual({
      url: 'https://project.supabase.co',
      key: 'sb_publishable_test',
    });
  });

  it('falls back to the legacy anon key and rejects incomplete values', () => {
    expect(resolveSupabaseConfig({
      VITE_SUPABASE_URL: ' https://project.supabase.co ',
      VITE_SUPABASE_ANON_KEY: ' anon_test ',
    })).toEqual({
      url: 'https://project.supabase.co',
      key: 'anon_test',
    });
    expect(resolveSupabaseConfig({ VITE_SUPABASE_URL: 'https://project.supabase.co' })).toBeNull();
  });
});
