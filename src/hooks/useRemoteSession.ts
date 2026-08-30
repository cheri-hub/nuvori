import { useCallback, useEffect, useRef, useState } from 'react';
import type { SessionSnapshot } from '../services/sessionRepository';
import {
  createRemoteSession,
  createRemoteSoloSession,
  endRemoteSession,
  joinRemoteSession,
  pauseRemoteSession,
  resumeRemoteSession,
  saveRemoteCheckIn,
  startRemoteSession,
  startRemoteSoloSession,
  subscribeToRemoteSession,
} from '../services/supabaseSessionService';

type RemoteSessionState = {
  sessionId?: string;
  snapshot?: SessionSnapshot;
  inviteToken?: string;
  pending: boolean;
  error?: string;
  connectionStatus: RemoteConnectionStatus;
  connect: (sessionId: string) => void;
  clear: () => void;
  create: (input: { plannedSeconds: number; inviteToken: string; inviteExpiresAt?: string }) => Promise<SessionSnapshot>;
  createSolo: (input: { plannedSeconds: number }) => Promise<SessionSnapshot>;
  join: (input: { sessionId: string; inviteToken: string; displayName: string }) => Promise<SessionSnapshot>;
  start: () => Promise<SessionSnapshot>;
  startSolo: (targetSessionId?: string) => Promise<SessionSnapshot>;
  saveCheckIn: (input: { sessionId: string; userId: string; energy?: number; resistance?: number; mood?: string }) => Promise<void>;
  pause: () => Promise<SessionSnapshot>;
  resume: () => Promise<SessionSnapshot>;
  end: (input: { outcome: 'normal' | 'adapted' | 'interrupted'; idempotencyKey: string }) => Promise<SessionSnapshot>;
};

export type RemoteConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting';

function messageFor(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Nao foi possivel sincronizar a sessao.';
}

export function useRemoteSession(): RemoteSessionState {
  const [sessionId, setSessionId] = useState<string>();
  const [snapshot, setSnapshot] = useState<SessionSnapshot>();
  const [inviteToken, setInviteToken] = useState<string>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [connectionStatus, setConnectionStatus] = useState<RemoteConnectionStatus>('idle');
  const [subscriptionVersion, setSubscriptionVersion] = useState(0);
  const reconnectAttemptRef = useRef(0);

  useEffect(() => {
    if (!sessionId) {
      setConnectionStatus('idle');
      return undefined;
    }
    setConnectionStatus('connecting');
    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleReconnect = () => {
      if (disposed || retryTimer) return;
      const attempt = reconnectAttemptRef.current;
      reconnectAttemptRef.current += 1;
      const delay = Math.min(1_000 * (2 ** attempt), 10_000);
      setConnectionStatus('reconnecting');
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        if (!disposed) setSubscriptionVersion((version) => version + 1);
      }, delay);
    };
    const cleanup = subscribeToRemoteSession(sessionId, setSnapshot, undefined, (status) => {
      if (status === 'SUBSCRIBED') {
        if (retryTimer) {
          clearTimeout(retryTimer);
          retryTimer = undefined;
        }
        reconnectAttemptRef.current = 0;
        setConnectionStatus('connected');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED' || status === 'SYNC_ERROR') {
        scheduleReconnect();
      }
    });
    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      cleanup();
    };
  }, [sessionId, subscriptionVersion]);

  const connect = useCallback((nextSessionId: string) => {
    setSessionId(nextSessionId);
    setError(undefined);
  }, []);

  const clear = useCallback(() => {
    setSessionId(undefined);
    setSnapshot(undefined);
    setInviteToken(undefined);
    setError(undefined);
    setConnectionStatus('idle');
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

  const createSolo = useCallback(async (input: { plannedSeconds: number }) => {
    const result = await run(() => createRemoteSoloSession(input));
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
  const startSolo = useCallback((targetSessionId?: string) => targetSessionId
    ? run(() => startRemoteSoloSession(targetSessionId)).then((result) => {
      setSnapshot(result);
      return result;
    })
    : command(startRemoteSoloSession), [command, run]);
  const saveCheckIn = useCallback(async (input: { sessionId: string; userId: string; energy?: number; resistance?: number; mood?: string }) => {
    await run(() => saveRemoteCheckIn(input));
  }, [run]);
  const pause = useCallback(() => command(pauseRemoteSession), [command]);
  const resume = useCallback(() => command(resumeRemoteSession), [command]);
  const end = useCallback((input: { outcome: 'normal' | 'adapted' | 'interrupted'; idempotencyKey: string }) => {
    if (!sessionId) return Promise.reject(new Error('Sessao remota ainda nao foi criada.'));
    return run(() => endRemoteSession({ ...input, sessionId })).then((result) => {
      setSnapshot(result);
      return result;
    });
  }, [run, sessionId]);

  return { sessionId, snapshot, inviteToken, pending, error, connectionStatus, connect, clear, create, createSolo, join, start, startSolo, saveCheckIn, pause, resume, end };
}
