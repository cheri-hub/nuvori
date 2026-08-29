import { useReducer } from 'react';
import { HomeShell } from './components/HomeShell';
import { MuruScene } from './components/MuruScene';
import { PrimaryAction } from './components/PrimaryAction';
import './styles/home.css';
import { CheckInSheet } from './components/CheckInSheet';
import { SocialInviteSheet } from './components/SocialInviteSheet';
import { homeReducer, initialHomeState } from './state/homeReducer';

export default function App() {
  const [state, dispatch] = useReducer(homeReducer, initialHomeState);
  const isRest = state.view === 'rest';
  return (
    <HomeShell>
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
      {state.view === 'active' && <div className="active-session" role="status"><p className="eyebrow">AGORA</p><h1>Sessao em andamento</h1><p>{state.durationMinutes} minutos para voltar para voce.</p></div>}
    </HomeShell>
  );
}
