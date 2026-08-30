import { useReducer, useRef } from 'react';
import { HomeShell } from './components/HomeShell';
import { MuruScene } from './components/MuruScene';
import { ActiveSession } from './components/ActiveSession';
import { CapsuleReveal } from './components/CapsuleReveal';
import { ReturnMessage } from './components/ReturnMessage';
import { PrimaryAction } from './components/PrimaryAction';
import './styles/home.css';
import { CheckInSheet } from './components/CheckInSheet';
import { SocialInviteSheet } from './components/SocialInviteSheet';
import { homeReducer, initialHomeState } from './state/homeReducer';
import { AuthGate } from './components/AuthGate';

export default function App() {
  const [state, dispatch] = useReducer(homeReducer, initialHomeState);
  const checkInTriggerRef = useRef<HTMLButtonElement>(null);
  const inviteTriggerRef = useRef<HTMLButtonElement>(null);
  const isRest = state.view === 'rest';
  const durationWords: Record<number, string> = { 5: 'Cinco', 10: 'Dez', 15: 'Quinze', 20: 'Vinte' };
  return <AuthGate><HomeShell hideBottomNav={state.view === 'active'}>
      {isRest && <><div className="scene-wrap"><MuruScene lineProgress={state.lineProgress} mood="idle" stage={state.muruStage} /></div>
      <div className="home-copy">
        <p className="eyebrow">UM PASSO DE CADA VEZ</p>
        <h1>O que cabe no seu dia?</h1>
        <p className="prompt">{durationWords[state.durationMinutes]} minutos para voltar para voce.</p>
        <PrimaryAction buttonRef={checkInTriggerRef} label={`Comecar ${state.durationMinutes} min`} onClick={() => dispatch({ type: 'OPEN_CHECKIN' })} />
        <button ref={inviteTriggerRef} className="secondary-action" type="button" onClick={() => dispatch({ type: 'OPEN_INVITE' })}>Convidar alguem <span aria-hidden="true">&#8599;</span></button>
      </div></>}
      {state.view === 'checkin' && <CheckInSheet state={state} dispatch={dispatch} returnFocusRef={checkInTriggerRef} />}
      {state.view === 'invite' && <SocialInviteSheet participant={state.participant} durationMinutes={state.durationMinutes} onParticipantJoin={() => dispatch({ type: 'JOIN_INVITE' })} onStart={() => dispatch({ type: 'START_SOCIAL' })} onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })} returnFocusRef={inviteTriggerRef} />}
      {state.view === 'active' && <ActiveSession state={state} dispatch={dispatch} />}
      {state.view === 'capsule' && <CapsuleReveal outcome={state.sessionOutcome} muruStage={state.muruStage} onContinue={() => dispatch({ type: 'CAPSULE_CONTINUE' })} />}
      {state.view === 'return' && <ReturnMessage onContinue={() => dispatch({ type: 'RETURN_CONTINUE' })} />}
    </HomeShell></AuthGate>;
}
