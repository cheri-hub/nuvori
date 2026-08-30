import { describe, expect, it, vi } from 'vitest';
import { ensureProfile, type ProfileClient } from './profileService';

describe('profileService', () => {
  it('upserts a public profile using auth metadata', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = { from: vi.fn().mockReturnValue({ upsert }) };

    await ensureProfile({ id: 'user-1', email: 'lia@example.com', user_metadata: { full_name: 'Lia Alves' } }, client as unknown as ProfileClient);

    expect(client.from).toHaveBeenCalledWith('profiles');
    expect(upsert).toHaveBeenCalledWith({ id: 'user-1', display_name: 'Lia Alves' }, { onConflict: 'id' });
  });

  it('falls back to the email prefix when metadata has no name', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = { from: vi.fn().mockReturnValue({ upsert }) };

    await ensureProfile({ id: 'user-1', email: 'lia@example.com', user_metadata: {} }, client as unknown as ProfileClient);

    expect(upsert).toHaveBeenCalledWith({ id: 'user-1', display_name: 'lia' }, { onConflict: 'id' });
  });
});
