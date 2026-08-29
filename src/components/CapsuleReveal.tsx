import type { HomeState } from '../state/homeReducer';

export function CapsuleReveal({ outcome, onContinue }: { outcome?: HomeState['sessionOutcome']; onContinue: () => void }) {
  const hasReward = outcome === 'normal' || outcome === 'adapted';
  return (
    <section className="capsule-reveal" aria-label="Capsula">
      <p className="eyebrow">UM MOMENTO PARA VOCE</p>
      <div className="capsule-mark" aria-hidden="true">{hasReward ? '✦' : '—'}</div>
      <h1>{hasReward ? 'Sua capsula chegou' : 'Sessao encerrada'}</h1>
      <p>{hasReward ? 'Um pequeno reconhecimento por ter estado presente.' : 'Voce pode voltar quando fizer sentido.'}</p>
      <button type="button" className="primary-action" onClick={onContinue}>Voltar ao inicio <span aria-hidden="true">&#8594;</span></button>
    </section>
  );
}
