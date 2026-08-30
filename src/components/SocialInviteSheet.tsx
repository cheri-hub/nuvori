import { useState, type RefObject } from 'react';
import { useModalDialog } from '../hooks/useModalDialog';
import type { PublicParticipant } from '../state/homeReducer';

type SocialInviteSheetProps = {
  participant?: PublicParticipant;
  durationMinutes: number;
  onParticipantJoin: () => void;
  onStart: () => void;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  inviteValue?: string;
  allowLocalSimulation?: boolean;
  pending?: boolean;
  error?: string;
  canRevoke?: boolean;
  onRevoke?: () => void;
};

export function SocialInviteSheet({ participant, durationMinutes, onParticipantJoin, onStart, onClose, returnFocusRef, inviteValue = `NUVORI-${durationMinutes}MIN`, allowLocalSimulation = true, pending = false, error, canRevoke = false, onRevoke }: SocialInviteSheetProps) {
  const [feedback, setFeedback] = useState<string>();
  const { dialogRef, onKeyDown } = useModalDialog(onClose, returnFocusRef);
  const copyInvite = async () => {
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(inviteValue);
      setFeedback('Convite copiado.');
    } catch {
      setFeedback('Nao foi possivel copiar o convite.');
    }
  };
  const shareInvite = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Convite Nuvori', text: inviteValue });
        setFeedback('Convite compartilhado.');
      } else {
        await copyInvite();
      }
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name === 'AbortError') return;
      setFeedback('Nao foi possivel compartilhar o convite.');
    }
  };
  return (
    <div className="sheet-backdrop">
      <section ref={dialogRef} className="sheet" role="dialog" aria-modal="true" aria-labelledby="invite-title" onKeyDown={onKeyDown}>
        <button data-dialog-initial-focus className="sheet-close" type="button" onClick={onClose} aria-label="Fechar">&#215;</button>
        <p className="eyebrow">JORNADA A DOIS</p>
        <h2 id="invite-title">Convidar alguem</h2>
        <p className="sheet-copy">Compartilhe este convite com alguem de confianca.</p>
        <div className="invite-code" aria-label="Codigo do convite">{inviteValue}</div>
        <div className="sheet-actions"><button type="button" className="outline-action" disabled={pending} onClick={() => void copyInvite()}>Copiar convite</button><button type="button" className="outline-action" disabled={pending} onClick={() => void shareInvite()}>Compartilhar</button></div>
        {participant ? (
          <div className="participant-presence" aria-label="Participante autenticada">
            <span className="participant-avatar" aria-label={`Avatar publico de ${participant.displayName}`}>{participant.avatarInitials}</span>
            <span><strong>{participant.displayName}</strong><small>Perfil autenticado - pronta para comecar</small></span>
          </div>
        ) : <p className="waiting-state">{allowLocalSimulation ? 'Aguardando a outra pessoa entrar...' : 'Convite ativo. Aguardando a outra pessoa entrar...'}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {feedback && <p className="invite-feedback" role="status">{feedback}</p>}
        <button className="primary-action sheet-action" type="button" disabled={pending || Boolean(error) || (!participant && !allowLocalSimulation)} onClick={participant ? onStart : onParticipantJoin}>
          {pending ? 'Sincronizando...' : participant ? `Comecar sessao com ${participant.displayName.split(' ')[0]}` : 'Simular entrada de participante'} <span aria-hidden="true">&#8594;</span>
        </button>
        {canRevoke && !participant && <button className="secondary-action" type="button" disabled={pending} onClick={onRevoke}>Revogar convite</button>}
      </section>
    </div>
  );
}
