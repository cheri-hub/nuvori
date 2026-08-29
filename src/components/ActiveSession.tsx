import { useEffect, useState, type Dispatch } from 'react';
import { MuruScene } from './MuruScene';
import { useSessionClock } from '../hooks/useSessionClock';
import type { HomeAction, HomeState } from '../state/homeReducer';

export function ActiveSession({ state, dispatch }: { state: HomeState; dispatch: Dispatch<HomeAction> }) {
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
      <MuruScene lineProgress={Math.max(state.lineProgress, elapsedProgress)} mood="walking" />
      <p className="session-timer" aria-label={`${clock.remainingSeconds} segundos restantes`}>{String(Math.floor(clock.remainingSeconds / 60)).padStart(2, '0')}:{String(clock.remainingSeconds % 60).padStart(2, '0')}</p>
      <h1>Sessao em andamento</h1>
      <p className="session-line">A linha acompanha o tempo, sem medir desempenho.</p>
      <div className="session-controls" role="group" aria-label="Controles do anfitriao">
        <button type="button" className="outline-action" onClick={() => isPaused ? dispatch({ type: 'RESUME_SESSION', resumedAt: Date.now() }) : dispatch({ type: 'PAUSE_SESSION', pausedAt: Date.now() })}>{isPaused ? 'Retomar' : 'Pausar'}</button>
        <button type="button" className="outline-action" onClick={() => dispatch({ type: 'END_NORMAL' })}>Encerrar</button>
        <button type="button" className="primary-action" onClick={() => dispatch({ type: 'END_ADAPTED' })}>Hoje esta dificil</button>
      </div>
      <button type="button" className="secondary-action" onClick={() => dispatch({ type: 'END_INTERRUPTED' })}>Preciso parar por hoje</button>
    </section>
  );
}
