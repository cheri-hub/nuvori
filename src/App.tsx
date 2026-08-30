import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { HomeShell } from './components/HomeShell';
import { MuruScene } from './components/MuruScene';
import { ActiveSession } from './components/ActiveSession';
import { CapsuleReveal } from './components/CapsuleReveal';
import { ReturnMessage } from './components/ReturnMessage';
import { PrimaryAction } from './components/PrimaryAction';
import './styles/home.css';
import { CheckInSheet } from './components/CheckInSheet';
import { SocialInviteSheet } from './components/SocialInviteSheet';
import { homeReducer, initialHomeState, type HomeAction } from './state/homeReducer';
import { AuthGate } from './components/AuthGate';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { useRemoteSession } from './hooks/useRemoteSession';
import { useInviteDeepLink } from './hooks/useInviteDeepLink';
import type { SessionSnapshot } from './services/sessionRepository';
import { buildInviteLink, parseInviteLink, type InviteLink } from './services/inviteLink';

function makeInviteToken(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return `${crypto.randomUUID()}${crypto.randomUUID()}`;
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function displayNameFor(user: { email?: string; user_metadata?: Record<string, unknown> }): string {
  const metadataName = user.user_metadata?.display_name ?? user.user_metadata?.full_name;
  return typeof metadataName === 'string' && metadataName.trim() ? metadataName.trim() : user.email?.split('@')[0] ?? 'Nuvori';
}

function syncClock(dispatch: React.Dispatch<HomeAction>, snapshot: SessionSnapshot) {
  dispatch({
    type: 'SYNC_REMOTE_SESSION',
    startedAt: snapshot.startedAt,
    pausedAt: snapshot.pausedAt,
    pausedSeconds: snapshot.accumulatedPauseSeconds ?? 0,
  });
}

export default function App() {
  const [state, dispatch] = useReducer(homeReducer, initialHomeState);
  const auth = useSupabaseAuth();
  const remote = useRemoteSession();
  const checkInTriggerRef = useRef<HTMLButtonElement>(null);
  const inviteTriggerRef = useRef<HTMLButtonElement>(null);
  const joinAttemptRef = useRef<string | undefined>(undefined);
  const isRest = state.view === 'rest';
  const remoteEnabled = auth.configured && Boolean(auth.user);
  const durationWords: Record<number, string> = { 5: 'Cinco', 10: 'Dez', 15: 'Quinze', 20: 'Vinte' };

  useEffect(() => {
    const snapshot = remote.snapshot;
    if (!snapshot) return;
    dispatch({ type: 'ATTACH_REMOTE_SESSION', sessionId: snapshot.id });
    if (state.view === 'invite' && snapshot.members.length >= 2 && !state.participant) dispatch({ type: 'JOIN_INVITE' });
    if (state.view === 'active' && snapshot.status === 'active') syncClock(dispatch, snapshot);
    if (state.view === 'active' && (snapshot.status === 'completed' || snapshot.status === 'adapted' || snapshot.status === 'interrupted')) {
      dispatch({ type: 'APPLY_REMOTE_END', outcome: snapshot.status === 'completed' ? 'normal' : snapshot.status });
    }
  }, [remote.snapshot, state.view, state.participant]);

  const acceptInvite = useCallback((invite: InviteLink) => {
    if (!remoteEnabled || !auth.user || remote.sessionId || joinAttemptRef.current === `${invite.sessionId}:${invite.inviteToken}`) return;
    joinAttemptRef.current = `${invite.sessionId}:${invite.inviteToken}`;
    dispatch({ type: 'OPEN_INVITE' });
    void remote.join({ sessionId: invite.sessionId, inviteToken: invite.inviteToken, displayName: displayNameFor(auth.user) })
      .then((snapshot) => {
        dispatch({ type: 'ATTACH_REMOTE_SESSION', sessionId: snapshot.id });
        if (snapshot.members.length >= 2) dispatch({ type: 'JOIN_INVITE' });
        const url = new URL(window.location.href);
        window.history.replaceState({}, '', `${url.pathname}${url.hash}`);
      })
      .catch(() => undefined);
  }, [auth.user, remote, remoteEnabled]);

  useInviteDeepLink(acceptInvite);

  useEffect(() => {
    const invite = parseInviteLink(window.location.href);
    if (invite) acceptInvite(invite);
  }, [acceptInvite]);

  function handleOpenInvite() {
    dispatch({ type: 'OPEN_INVITE' });
    if (remoteEnabled) {
      void remote.create({ plannedSeconds: state.durationMinutes * 60, inviteToken: makeInviteToken() })
        .then((snapshot) => dispatch({ type: 'ATTACH_REMOTE_SESSION', sessionId: snapshot.id }))
        .catch(() => undefined);
    }
  }

  const handleStartSolo = useCallback((durationMinutes: number) => {
    if (!remoteEnabled || !auth.user) {
      dispatch({ type: 'START_SOLO', durationMinutes });
      return;
    }
    void (async () => {
      const session = await remote.createSolo({ plannedSeconds: durationMinutes * 60 });
      await remote.saveCheckIn({
        sessionId: session.id,
        userId: auth.user!.id,
        energy: state.energy,
        resistance: state.resistance,
        mood: state.mood,
      });
      const started = await remote.startSolo(session.id);
      dispatch({ type: 'START_SOLO', durationMinutes });
      dispatch({ type: 'ATTACH_REMOTE_SESSION', sessionId: session.id });
      syncClock(dispatch, started);
    })().catch(() => undefined);
  }, [auth.user, remote, remoteEnabled, state.energy, state.mood, state.resistance]);

  function handleStartSocial() {
    if (!remoteEnabled) {
      dispatch({ type: 'START_SOCIAL' });
      return;
    }
    if (!remote.sessionId) return;
    void remote.start()
      .then((snapshot) => {
        dispatch({ type: 'START_SOCIAL' });
        syncClock(dispatch, snapshot);
      })
      .catch(() => undefined);
  }

  function handlePause() {
    if (remoteEnabled && remote.sessionId) {
      void remote.pause().then((snapshot) => syncClock(dispatch, snapshot)).catch(() => undefined);
      return;
    }
    dispatch({ type: 'PAUSE_SESSION', pausedAt: Date.now() });
  }

  function handleResume() {
    if (remoteEnabled && remote.sessionId) {
      void remote.resume().then((snapshot) => syncClock(dispatch, snapshot)).catch(() => undefined);
      return;
    }
    dispatch({ type: 'RESUME_SESSION', resumedAt: Date.now() });
  }

  function handleEnd(outcome: 'normal' | 'adapted' | 'interrupted') {
    if (remoteEnabled && remote.sessionId) {
      void remote.end({ outcome, idempotencyKey: `${remote.sessionId}:end` })
        .then(() => dispatch({ type: 'APPLY_REMOTE_END', outcome }))
        .catch(() => undefined);
      return;
    }
    if (outcome === 'normal') dispatch({ type: 'END_NORMAL', endedAt: Date.now() });
    if (outcome === 'adapted') dispatch({ type: 'END_ADAPTED' });
    if (outcome === 'interrupted') dispatch({ type: 'END_INTERRUPTED' });
  }

  const inviteOrigin = Capacitor.isNativePlatform() ? 'nuvori://session' : window.location.origin;
  const inviteValue = remote.inviteToken && remote.sessionId
    ? buildInviteLink(inviteOrigin, remote.sessionId, remote.inviteToken)
    : `NUVORI-${state.durationMinutes}MIN`;

  return <AuthGate><HomeShell hideBottomNav={state.view === 'active'}>
    {isRest && <><div className="scene-wrap"><MuruScene lineProgress={state.lineProgress} mood="idle" stage={state.muruStage} /></div>
      <div className="home-copy">
        <p className="eyebrow">UM PASSO DE CADA VEZ</p>
        <h1>O que cabe no seu dia?</h1>
        <p className="prompt">{durationWords[state.durationMinutes]} minutos para voltar para voce.</p>
        <PrimaryAction buttonRef={checkInTriggerRef} label={`Comecar ${state.durationMinutes} min`} onClick={() => dispatch({ type: 'OPEN_CHECKIN' })} />
        <button ref={inviteTriggerRef} className="secondary-action" type="button" onClick={handleOpenInvite}>Convidar alguem <span aria-hidden="true">&#8599;</span></button>
      </div></>}
    {state.view === 'checkin' && <CheckInSheet state={state} dispatch={dispatch} returnFocusRef={checkInTriggerRef} onStart={handleStartSolo} pending={remote.pending} error={remote.error} />}
    {state.view === 'invite' && <SocialInviteSheet participant={state.participant} durationMinutes={state.durationMinutes} inviteValue={inviteValue} allowLocalSimulation={!remoteEnabled} pending={remote.pending} error={remote.error} onParticipantJoin={() => dispatch({ type: 'JOIN_INVITE' })} onStart={handleStartSocial} onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })} returnFocusRef={inviteTriggerRef} />}
    {state.view === 'active' && <ActiveSession state={state} dispatch={dispatch} pending={remote.pending} error={remote.error} syncStatus={remoteEnabled ? remote.connectionStatus : undefined} onPause={handlePause} onResume={handleResume} onEndNormal={() => handleEnd('normal')} onEndAdapted={() => handleEnd('adapted')} onEndInterrupted={() => handleEnd('interrupted')} />}
    {state.view === 'capsule' && <CapsuleReveal outcome={state.sessionOutcome} muruStage={state.muruStage} onContinue={() => dispatch({ type: 'CAPSULE_CONTINUE' })} />}
    {state.view === 'return' && <ReturnMessage onContinue={() => dispatch({ type: 'RETURN_CONTINUE' })} />}
  </HomeShell></AuthGate>;
}
