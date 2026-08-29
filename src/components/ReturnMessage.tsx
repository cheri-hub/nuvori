export function ReturnMessage({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="return-message" aria-label="Continuar jornada">
      <p className="eyebrow">A JORNADA CONTINUA</p>
      <h1>O mesmo lugar, um novo momento.</h1>
      <p>Muru fica aqui com voce. Quando quiser, e so dar o proximo passo.</p>
      <button type="button" className="primary-action" onClick={onContinue}>Voltar ao inicio <span aria-hidden="true">&#8594;</span></button>
    </section>
  );
}
