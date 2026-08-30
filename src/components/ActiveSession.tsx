import { useEffect, useState, type Dispatch } from 'react';
import { MuruScene } from './MuruScene';
import { useSessionClock } from '../hooks/useSessionClock';
import type { HomeAction, HomeState } from '../state/homeReducer';

type ActiveSessionProps = {
  state: HomeState;
  dispatch: Dispatch<HomeAction>;
  pending?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onEndNormal?: () => void;
  onEndAdapted?: () => void;
  onEndInterrupted?: () => void;
  error?: string;
  syncStatus?: 'idle' | 'connecting' | 'connected' | 'reconnecting';
};

export function ActiveSession({ state, dispatch, pending = false, onPause, onResume, onEndNormal, onEndAdapted, onEndInterrupted, error, syncStatus }: ActiveSessionProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const clock = useSessionClock({ startedAt: state.startedAt ?? now, durationSeconds: state.durationMinutes * 60, pausedAt: state.pausedAt, pausedSeconds: state.pausedSeconds, now });
  const isPaused = state.pausedAt !== undefined;
  const elapsedProgress = clock.progress;
  return (
    <section className="active-session" aria-label="Sessao em andamento">
      <p className="eyebrow">AGORA</p>
      <MuruScene lineProgress={Math.max(state.lineProgress, elapsedProgress)} mood="walking" stage={state.muruStage} />
      <p className="session-timer" aria-label={`${clock.remainingSeconds} segundos restantes`}>{String(Math.floor(clock.remainingSeconds / 60)).padStart(2, '0')}:{String(clock.remainingSeconds % 60).padStart(2, '0')}</p>
      <h1>Sessao em andamento</h1>
      <p className="session-line">A linha acompanha o tempo, sem medir desempenho.</p>
      {syncStatus && <p className={`sync-status sync-${syncStatus}`} role="status">{syncStatus === 'connected' ? 'Sincronizado' : syncStatus === 'reconnecting' ? 'Reconectando...' : 'Conectando...'}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      {state.isHost && <>
        <div className="session-controls" role="group" aria-label="Controles do anfitriao">
          <button type="button" className="outline-action" disabled={pending} onClick={() => { if (isPaused) { onResume ? onResume() : dispatch({ type: 'RESUME_SESSION', resumedAt: Date.now() }); } else { onPause ? onPause() : dispatch({ type: 'PAUSE_SESSION', pausedAt: Date.now() }); } }}>{isPaused ? 'Retomar' : 'Pausar'}</button>
          <button type="button" className="outline-action" disabled={!clock.isComplete || pending} onClick={() => { if (onEndNormal) onEndNormal(); else dispatch({ type: 'END_NORMAL', endedAt: now }); }}>Encerrar</button>
          <button type="button" className="primary-action" disabled={pending} onClick={() => { if (onEndAdapted) onEndAdapted(); else dispatch({ type: 'END_ADAPTED' }); }}>Hoje esta dificil</button>
        </div>
        <button type="button" className="secondary-action" disabled={pending} onClick={() => { if (onEndInterrupted) onEndInterrupted(); else dispatch({ type: 'END_INTERRUPTED' }); }}>Preciso parar por hoje</button>
      </>}
    </section>
  );
}
