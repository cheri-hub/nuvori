import { HomeShell } from './components/HomeShell';
import { MuruScene } from './components/MuruScene';
import { PrimaryAction } from './components/PrimaryAction';
import './styles/home.css';

export default function App() {
  return (
    <HomeShell>
      <div className="scene-wrap"><MuruScene lineProgress={0.34} mood="idle" /></div>
      <div className="home-copy">
        <p className="eyebrow">UM PASSO DE CADA VEZ</p>
        <h1>O que cabe no seu dia?</h1>
        <p className="prompt">Cinco minutos para voltar para voce.</p>
        <PrimaryAction label="Comecar 5 min" onClick={() => undefined} />
        <button className="secondary-action" type="button">Convidar alguem <span aria-hidden="true">&#8599;</span></button>
      </div>
    </HomeShell>
  );
}
