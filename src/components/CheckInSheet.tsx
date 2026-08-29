import { useState, type Dispatch, type RefObject } from 'react';
import { CheckInControls } from './CheckInControls';
import { useModalDialog } from '../hooks/useModalDialog';
import type { HomeAction, HomeState } from '../state/homeReducer';

export function CheckInSheet({ state, dispatch, returnFocusRef }: { state: HomeState; dispatch: Dispatch<HomeAction>; returnFocusRef: RefObject<HTMLButtonElement | null> }) {
  const [duration, setDuration] = useState(state.durationMinutes);
  const close = () => dispatch({ type: 'CLOSE_OVERLAY' });
  const { dialogRef, onKeyDown } = useModalDialog(close, returnFocusRef);
  return (
    <div className="sheet-backdrop">
      <section ref={dialogRef} className="sheet" role="dialog" aria-modal="true" aria-labelledby="checkin-title" onKeyDown={onKeyDown}>
        <button data-dialog-initial-focus className="sheet-close" type="button" onClick={close} aria-label="Fechar">&#215;</button>
        <p className="eyebrow">UM PASSO DE CADA VEZ</p>
        <h2 id="checkin-title">Check-in: como voce chega hoje?</h2>
        <CheckInControls state={state} dispatch={dispatch} />
        <div className="duration-choice" role="group" aria-label="Duracao">
          {[5, 10, 15, 20].map((minutes) => (
            <button key={minutes} type="button" className={duration === minutes ? 'is-selected' : ''} aria-pressed={duration === minutes} aria-label={`${minutes} minutos${minutes === 5 ? ', recomendado' : ''}`} onClick={() => setDuration(minutes)}>{minutes} min</button>
          ))}
        </div>
        <button className="primary-action sheet-action" type="button" onClick={() => dispatch({ type: 'START_SOLO', durationMinutes: duration })}>Comecar {duration} min <span aria-hidden="true">&#8594;</span></button>
      </section>
    </div>
  );
}
