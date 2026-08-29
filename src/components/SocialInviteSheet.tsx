export function SocialInviteSheet({ onJoin, onClose }: { onJoin: () => void; onClose: () => void }) {
  return (
    <div className="sheet-backdrop">
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <button className="sheet-close" type="button" onClick={onClose} aria-label="Fechar">&#215;</button>
        <p className="eyebrow">JORNADA A DOIS</p>
        <h2 id="invite-title">Convidar alguem</h2>
        <p className="sheet-copy">Compartilhe este convite com alguem de confianca.</p>
        <div className="invite-code" aria-label="Codigo do convite">NUVORI-5MIN</div>
        <div className="sheet-actions"><button type="button" className="outline-action" onClick={() => navigator.clipboard?.writeText('NUVORI-5MIN')}>Copiar convite</button><button type="button" className="outline-action" onClick={() => navigator.share?.({ title: 'Convite Nuvori', text: 'NUVORI-5MIN' })}>Compartilhar</button></div>
        <p className="waiting-state">Aguardando a outra pessoa entrar...</p>
        <button className="primary-action sheet-action" type="button" onClick={onJoin}>Entrar na sessao <span aria-hidden="true">&#8594;</span></button>
      </section>
    </div>
  );
}
