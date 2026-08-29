import { useReducer } from 'react';
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

export default function App() {
  const [state, dispatch] = useReducer(homeReducer, initialHomeState);
  const isRest = state.view === 'rest';
  return (
    <HomeShell hideBottomNav={state.view === 'active'}>
      {isRest && <><div className="scene-wrap"><MuruScene lineProgress={state.lineProgress} mood="idle" /></div>
      <div className="home-copy">
        <p className="eyebrow">UM PASSO DE CADA VEZ</p>
        <h1>O que cabe no seu dia?</h1>
        <p className="prompt">Cinco minutos para voltar para voce.</p>
        <PrimaryAction label="Comecar 5 min" onClick={() => dispatch({ type: 'OPEN_CHECKIN' })} />
        <button className="secondary-action" type="button" onClick={() => dispatch({ type: 'OPEN_INVITE' })}>Convidar alguem <span aria-hidden="true">&#8599;</span></button>
      </div></>}
      {state.view === 'checkin' && <CheckInSheet state={state} dispatch={dispatch} />}
      {state.view === 'invite' && <SocialInviteSheet onJoin={() => dispatch({ type: 'JOIN_INVITE' })} onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })} />}
      {state.view === 'active' && <ActiveSession state={state} dispatch={dispatch} />}
      {state.view === 'capsule' && <CapsuleReveal outcome={state.sessionOutcome} onContinue={() => dispatch({ type: 'CAPSULE_CONTINUE' })} />}
      {state.view === 'return' && <ReturnMessage onContinue={() => dispatch({ type: 'RETURN_CONTINUE' })} />}
    </HomeShell>
  );
}
