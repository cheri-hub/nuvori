import type { Dispatch } from 'react';
import type { HomeAction, HomeState } from '../state/homeReducer';

export function CheckInControls({ state, dispatch }: { state: HomeState; dispatch: Dispatch<HomeAction> }) {
  return (
    <div className="checkin-controls">
      <fieldset>
        <legend>Como esta sua energia?</legend>
        <div className="choice-row">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="choice">
              <input type="radio" name="energy" checked={state.energy === value} onChange={() => dispatch({ type: 'SET_ENERGY', energy: value })} />
              <span>{value}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Quanto quer se desafiar?</legend>
        <input aria-label="Resistencia" type="range" min="1" max="10" value={state.resistance ?? 4} onChange={(event) => dispatch({ type: 'SET_RESISTANCE', resistance: Number(event.target.value) })} />
      </fieldset>
      <label className="mood-field">Quer nomear o momento? <input type="text" value={state.mood ?? ''} placeholder="Opcional" onChange={(event) => dispatch({ type: 'SET_MOOD', mood: event.target.value })} /></label>
    </div>
  );
}
