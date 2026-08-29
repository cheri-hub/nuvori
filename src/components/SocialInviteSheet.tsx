import type { RefObject } from 'react';
import { useModalDialog } from '../hooks/useModalDialog';
import type { PublicParticipant } from '../state/homeReducer';

type SocialInviteSheetProps = {
  participant?: PublicParticipant;
  durationMinutes: number;
  onParticipantJoin: () => void;
  onStart: () => void;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

export function SocialInviteSheet({ participant, durationMinutes, onParticipantJoin, onStart, onClose, returnFocusRef }: SocialInviteSheetProps) {
  const { dialogRef, onKeyDown } = useModalDialog(onClose, returnFocusRef);
  return (
    <div className="sheet-backdrop">
      <section ref={dialogRef} className="sheet" role="dialog" aria-modal="true" aria-labelledby="invite-title" onKeyDown={onKeyDown}>
        <button data-dialog-initial-focus className="sheet-close" type="button" onClick={onClose} aria-label="Fechar">&#215;</button>
        <p className="eyebrow">JORNADA A DOIS</p>
        <h2 id="invite-title">Convidar alguem</h2>
        <p className="sheet-copy">Compartilhe este convite com alguem de confianca.</p>
        <div className="invite-code" aria-label="Codigo do convite">NUVORI-{durationMinutes}MIN</div>
        <div className="sheet-actions"><button type="button" className="outline-action" onClick={() => navigator.clipboard?.writeText(`NUVORI-${durationMinutes}MIN`)}>Copiar convite</button><button type="button" className="outline-action" onClick={() => navigator.share?.({ title: 'Convite Nuvori', text: `NUVORI-${durationMinutes}MIN` })}>Compartilhar</button></div>
        {participant ? (
          <div className="participant-presence" aria-label="Participante autenticada">
            <span className="participant-avatar" aria-label={`Avatar publico de ${participant.displayName}`}>{participant.avatarInitials}</span>
            <span><strong>{participant.displayName}</strong><small>Perfil autenticado - pronta para comecar</small></span>
          </div>
        ) : <p className="waiting-state">Aguardando a outra pessoa entrar...</p>}
        <button className="primary-action sheet-action" type="button" onClick={participant ? onStart : onParticipantJoin}>
          {participant ? `Comecar sessao com ${participant.displayName.split(' ')[0]}` : 'Simular entrada de participante'} <span aria-hidden="true">&#8594;</span>
        </button>
      </section>
    </div>
  );
}
