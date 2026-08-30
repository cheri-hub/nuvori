import { useCallback, useEffect, useState } from 'react';
import type { SessionSnapshot } from '../services/sessionRepository';
import {
  createRemoteSession,
  endRemoteSession,
  joinRemoteSession,
  pauseRemoteSession,
  resumeRemoteSession,
  startRemoteSession,
  subscribeToRemoteSession,
} from '../services/supabaseSessionService';

type RemoteSessionState = {
  sessionId?: string;
  snapshot?: SessionSnapshot;
  inviteToken?: string;
  pending: boolean;
  error?: string;
  connect: (sessionId: string) => void;
  clear: () => void;
  create: (input: { plannedSeconds: number; inviteToken: string; inviteExpiresAt?: string }) => Promise<SessionSnapshot>;
  join: (input: { sessionId: string; inviteToken: string; displayName: string }) => Promise<SessionSnapshot>;
  start: () => Promise<SessionSnapshot>;
  pause: () => Promise<SessionSnapshot>;
  resume: () => Promise<SessionSnapshot>;
  end: (input: { outcome: 'normal' | 'adapted' | 'interrupted'; idempotencyKey: string }) => Promise<SessionSnapshot>;
};

function messageFor(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Nao foi possivel sincronizar a sessao.';
}

export function useRemoteSession(): RemoteSessionState {
  const [sessionId, setSessionId] = useState<string>();
  const [snapshot, setSnapshot] = useState<SessionSnapshot>();
  const [inviteToken, setInviteToken] = useState<string>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!sessionId) return undefined;
    return subscribeToRemoteSession(sessionId, setSnapshot);
  }, [sessionId]);

  const connect = useCallback((nextSessionId: string) => {
    setSessionId(nextSessionId);
    setError(undefined);
  }, []);

  const clear = useCallback(() => {
    setSessionId(undefined);
    setSnapshot(undefined);
    setInviteToken(undefined);
    setError(undefined);
  }, []);

  const run = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    setPending(true);
    setError(undefined);
    try {
      return await operation();
    } catch (remoteError) {
      setError(messageFor(remoteError));
      throw remoteError;
    } finally {
      setPending(false);
    }
  }, []);

  const create = useCallback(async (input: { plannedSeconds: number; inviteToken: string; inviteExpiresAt?: string }) => {
    const result = await run(() => createRemoteSession(input));
    setSessionId(result.session.id);
    setSnapshot(result.session);
    setInviteToken(result.inviteToken);
    return result.session;
  }, [run]);

  const join = useCallback(async (input: { sessionId: string; inviteToken: string; displayName: string }) => {
    const result = await run(() => joinRemoteSession(input));
    setSessionId(result.id);
    setSnapshot(result);
    return result;
  }, [run]);

  const command = useCallback(async (operation: (id: string) => Promise<SessionSnapshot>) => {
    if (!sessionId) throw new Error('Sessao remota ainda nao foi criada.');
    const result = await run(() => operation(sessionId));
    setSnapshot(result);
    return result;
  }, [run, sessionId]);

  const start = useCallback(() => command(startRemoteSession), [command]);
  const pause = useCallback(() => command(pauseRemoteSession), [command]);
  const resume = useCallback(() => command(resumeRemoteSession), [command]);
  const end = useCallback((input: { outcome: 'normal' | 'adapted' | 'interrupted'; idempotencyKey: string }) => {
    if (!sessionId) return Promise.reject(new Error('Sessao remota ainda nao foi criada.'));
    return run(() => endRemoteSession({ ...input, sessionId })).then((result) => {
      setSnapshot(result);
      return result;
    });
  }, [run, sessionId]);

  return { sessionId, snapshot, inviteToken, pending, error, connect, clear, create, join, start, pause, resume, end };
}
