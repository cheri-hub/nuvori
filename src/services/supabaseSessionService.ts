import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { RewardGrant, SessionMember, SessionSnapshot, SessionStatus } from './sessionRepository';

export type RemoteSessionChannel = {
  on: (event: 'postgres_changes', filter: Record<string, string>, callback: (payload: unknown) => void | Promise<void>) => RemoteSessionChannel;
  subscribe: (callback?: (status: string) => void) => RemoteSessionChannel;
  unsubscribe: () => Promise<unknown> | unknown;
};

export type RemoteSessionTable = {
  upsert: (values: Record<string, unknown>, options?: { onConflict?: string }) => Promise<{ error: { message: string } | null }>;
};

export type RemoteSessionClient = {
  rpc: (functionName: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  channel: (name: string) => RemoteSessionChannel;
  from: (table: string) => RemoteSessionTable;
};

export class RemoteSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RemoteSessionError';
  }
}

const defaultClient = supabase as unknown as RemoteSessionClient | null;

function requireClient(client: RemoteSessionClient | null): RemoteSessionClient {
  if (!client) throw new RemoteSessionError('Supabase nao esta configurado.');
  return client;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RemoteSessionError('Resposta de sessao invalida.');
  return value as Record<string, unknown>;
}

function optionalDate(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function mapMember(value: unknown): SessionMember {
  const member = asRecord(value);
  if (typeof member.user_id !== 'string' || (member.role !== 'host' && member.role !== 'participant')) {
    throw new RemoteSessionError('Membro de sessao invalido.');
  }
  return {
    userId: member.user_id,
    role: member.role,
    displayName: typeof member.display_name === 'string' ? member.display_name : undefined,
  };
}

function mapReward(value: unknown): RewardGrant {
  const reward = asRecord(value);
  if (typeof reward.id !== 'string' || typeof reward.user_id !== 'string' || typeof reward.session_id !== 'string') {
    throw new RemoteSessionError('Recompensa de sessao invalida.');
  }
  const capsuleType = reward.capsule_type === 'companionship' ? 'companionship' : 'journey';
  return { id: reward.id, userId: reward.user_id, sessionId: reward.session_id, capsuleType };
}

export function mapRemoteSession(value: unknown): SessionSnapshot {
  const session = asRecord(value);
  if (typeof session.id !== 'string' || typeof session.host_user_id !== 'string' || typeof session.planned_seconds !== 'number' || typeof session.status !== 'string') {
    throw new RemoteSessionError('Snapshot de sessao invalido.');
  }
  return {
    id: session.id,
    hostId: session.host_user_id,
    plannedSeconds: session.planned_seconds,
    inviteTokenHash: '',
    status: session.status as SessionStatus,
    members: Array.isArray(session.members) ? session.members.map(mapMember) : [],
    rewards: Array.isArray(session.rewards) ? session.rewards.map(mapReward) : [],
    startedAt: optionalDate(session.started_at),
    pausedAt: optionalDate(session.paused_at),
    accumulatedPauseSeconds: typeof session.accumulated_pause_seconds === 'number' ? session.accumulated_pause_seconds : 0,
    endedAt: optionalDate(session.ended_at),
  };
}

async function callRpc(functionName: string, args: Record<string, unknown>, client: RemoteSessionClient | null): Promise<unknown> {
  const { data, error } = await requireClient(client).rpc(functionName, args);
  if (error) throw new RemoteSessionError(error.message);
  return data;
}

function snapshotFrom(value: unknown): SessionSnapshot {
  const record = asRecord(value);
  return mapRemoteSession(record.session ?? record);
}

export async function createRemoteSession(
  input: { plannedSeconds: number; inviteToken: string; inviteExpiresAt?: string },
  client: RemoteSessionClient | null = defaultClient,
): Promise<{ session: SessionSnapshot; inviteToken: string }> {
  const data = await callRpc('create_social_session', {
    p_planned_seconds: input.plannedSeconds,
    p_invite_token: input.inviteToken,
    ...(input.inviteExpiresAt ? { p_invite_expires_at: input.inviteExpiresAt } : {}),
  }, client);
  const record = asRecord(data);
  if (typeof record.invite_token !== 'string') throw new RemoteSessionError('Convite remoto nao retornou um token.');
  return { session: snapshotFrom(record), inviteToken: record.invite_token };
}

export async function createRemoteSoloSession(
  input: { plannedSeconds: number },
  client: RemoteSessionClient | null = defaultClient,
): Promise<SessionSnapshot> {
  return snapshotFrom(await callRpc('create_solo_session', {
    p_planned_seconds: input.plannedSeconds,
  }, client));
}

export async function joinRemoteSession(
  input: { sessionId: string; inviteToken: string; displayName: string },
  client: RemoteSessionClient | null = defaultClient,
): Promise<SessionSnapshot> {
  return snapshotFrom(await callRpc('join_social_session', {
    p_session_id: input.sessionId,
    p_invite_token: input.inviteToken,
    p_display_name: input.displayName,
  }, client));
}

export async function revokeRemoteInvite(sessionId: string, client: RemoteSessionClient | null = defaultClient): Promise<SessionSnapshot> {
  return snapshotFrom(await callRpc('revoke_social_invite', { p_session_id: sessionId }, client));
}

export async function startRemoteSession(sessionId: string, client: RemoteSessionClient | null = defaultClient): Promise<SessionSnapshot> {
  return snapshotFrom(await callRpc('start_social_session', { p_session_id: sessionId }, client));
}

export async function startRemoteSoloSession(sessionId: string, client: RemoteSessionClient | null = defaultClient): Promise<SessionSnapshot> {
  return snapshotFrom(await callRpc('start_solo_session', { p_session_id: sessionId }, client));
}

export async function saveRemoteCheckIn(
  input: { sessionId: string; userId: string; energy?: number; resistance?: number; mood?: string },
  client: RemoteSessionClient | null = defaultClient,
): Promise<void> {
  const { error } = await requireClient(client).from('session_checkins').upsert({
    session_id: input.sessionId,
    user_id: input.userId,
    energy: input.energy ?? null,
    resistance: input.resistance ?? null,
    mood: input.mood?.trim() || null,
  }, { onConflict: 'session_id,user_id' });
  if (error) throw new RemoteSessionError(error.message);
}

export async function pauseRemoteSession(sessionId: string, client: RemoteSessionClient | null = defaultClient): Promise<SessionSnapshot> {
  return snapshotFrom(await callRpc('pause_social_session', { p_session_id: sessionId }, client));
}

export async function resumeRemoteSession(sessionId: string, client: RemoteSessionClient | null = defaultClient): Promise<SessionSnapshot> {
  return snapshotFrom(await callRpc('resume_social_session', { p_session_id: sessionId }, client));
}

export async function endRemoteSession(
  input: { sessionId: string; outcome: 'normal' | 'adapted' | 'interrupted'; idempotencyKey: string },
  client: RemoteSessionClient | null = defaultClient,
): Promise<SessionSnapshot> {
  return snapshotFrom(await callRpc('end_social_session', {
    p_session_id: input.sessionId,
    p_outcome: input.outcome,
    p_idempotency_key: input.idempotencyKey,
  }, client));
}

export async function fetchRemoteSession(sessionId: string, client: RemoteSessionClient | null = defaultClient): Promise<SessionSnapshot> {
  return snapshotFrom(await callRpc('session_snapshot', { target_session_id: sessionId }, client));
}

export function subscribeToRemoteSession(
  sessionId: string,
  onSnapshot: (snapshot: SessionSnapshot) => void,
  client: RemoteSessionClient | null = defaultClient,
  onStatus?: (status: string) => void,
): () => void {
  if (!client) return () => undefined;
  const channel = requireClient(client).channel(`session:${sessionId}`);
  const refresh = async () => {
    try {
      onSnapshot(await fetchRemoteSession(sessionId, client));
    } catch (error) {
      onStatus?.('SYNC_ERROR');
      if (import.meta.env.DEV) console.error(error);
    }
  };
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` }, refresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'session_members', filter: `session_id=eq.${sessionId}` }, refresh)
    .subscribe((status) => {
      onStatus?.(status);
      if (status === 'SUBSCRIBED') void refresh();
    });
  return () => { void channel.unsubscribe(); };
}

export type { SupabaseClient };
