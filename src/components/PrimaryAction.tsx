type PrimaryActionProps = { label: string; onClick: () => void };

export function PrimaryAction({ label, onClick }: PrimaryActionProps) {
  return <button className="primary-action" type="button" onClick={onClick}>{label}<span aria-hidden="true">&#8594;</span></button>;
}
