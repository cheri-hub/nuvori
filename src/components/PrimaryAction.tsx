import type { Ref } from 'react';

type PrimaryActionProps = { label: string; onClick: () => void; buttonRef?: Ref<HTMLButtonElement> };

export function PrimaryAction({ label, onClick, buttonRef }: PrimaryActionProps) {
  return <button ref={buttonRef} className="primary-action" type="button" onClick={onClick}>{label}<span aria-hidden="true">&#8594;</span></button>;
}
