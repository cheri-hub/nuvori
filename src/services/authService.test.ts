import { describe, expect, it, vi } from 'vitest';
import { AuthInputError, AuthUnavailableError, requestMagicLink, subscribeToAuthChanges, type AuthClient } from './authService';

function fakeClient() {
  return {
    auth: {
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  };
}

describe('authService', () => {
  it('trims the email and requests a magic link with a redirect', async () => {
    const client = fakeClient();

    await requestMagicLink('  pessoa@example.com  ', client as unknown as AuthClient);

    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'pessoa@example.com',
      options: { emailRedirectTo: window.location.origin },
    });
  });

  it('rejects malformed email and unavailable Supabase separately', async () => {
    await expect(requestMagicLink('not-an-email', fakeClient() as unknown as AuthClient)).rejects.toBeInstanceOf(AuthInputError);
    await expect(requestMagicLink('pessoa@example.com', null)).rejects.toBeInstanceOf(AuthUnavailableError);
  });

  it('returns an unsubscribe function for auth state changes', () => {
    const client = fakeClient();
    const unsubscribe = subscribeToAuthChanges(() => undefined, client as unknown as AuthClient);

    unsubscribe();

    expect(client.auth.onAuthStateChange).toHaveBeenCalledOnce();
    const subscription = client.auth.onAuthStateChange.mock.results[0].value.data.subscription;
    expect(subscription.unsubscribe).toHaveBeenCalledOnce();
  });
});
