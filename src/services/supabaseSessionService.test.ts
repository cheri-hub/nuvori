import { describe, expect, it, vi } from 'vitest';
import type { RemoteSessionClient } from './supabaseSessionService';
import { RemoteSessionError, createRemoteSession, endRemoteSession, subscribeToRemoteSession } from './supabaseSessionService';

function snapshotPayload() {
  return {
    id: 'session-1',
    host_user_id: 'user-host',
    status: 'active',
    planned_seconds: 300,
    started_at: '2026-08-30T10:00:00.000Z',
    paused_at: null,
    accumulated_pause_seconds: 0,
    ended_at: null,
    members: [{ user_id: 'user-host', role: 'host', display_name: 'Nuvori' }],
    rewards: [],
  };
}

describe('supabaseSessionService', () => {
  it('creates a remote session with the raw invite token', async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: { session: snapshotPayload(), invite_token: 'token-1234567890' }, error: null }) } as unknown as RemoteSessionClient;

    const result = await createRemoteSession({ plannedSeconds: 300, inviteToken: 'token-1234567890' }, client);

    expect(client.rpc).toHaveBeenCalledWith('create_social_session', expect.objectContaining({
      p_planned_seconds: 300,
      p_invite_token: 'token-1234567890',
    }));
    expect(result.session.id).toBe('session-1');
    expect(result.inviteToken).toBe('token-1234567890');
  });

  it('converts RPC failures to a stable remote session error', async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'invite expired' } }) } as unknown as RemoteSessionClient;

    await expect(endRemoteSession({ sessionId: 'session-1', outcome: 'interrupted', idempotencyKey: 'end-1' }, client))
      .rejects.toMatchObject({ name: RemoteSessionError.name, message: 'invite expired' });
  });

  it('cleans up the Realtime channel', () => {
    const channel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn().mockResolvedValue('ok'),
    };
    const client = { channel: vi.fn().mockReturnValue(channel) } as unknown as RemoteSessionClient;

    const unsubscribe = subscribeToRemoteSession('session-1', () => undefined, client);
    unsubscribe();

    expect(client.channel).toHaveBeenCalledWith('session:session-1');
    expect(channel.unsubscribe).toHaveBeenCalledOnce();
  });
});
