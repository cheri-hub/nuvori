const items = [
  { label: 'Home', icon: 'home' },
  { label: 'Missao', icon: 'flag' },
  { label: 'Colecao', icon: 'collection' },
  { label: 'Perfil', icon: 'profile' },
] as const;

function NavIcon({ name }: { name: (typeof items)[number]['icon'] }) {
  if (name === 'home') return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m4 10 8-6 8 6v9.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5V10Z" /><path d="M9.5 20v-6h5v6" /></svg>;
  if (name === 'flag') return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 21V4m0 1h11l-2 4 2 4H5" /></svg>;
  if (name === 'collection') return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="4" width="12" height="14" rx="1" /><path d="M8 7h6M8 11h6M8 15h4M8 20h11V7" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3" /><path d="M5.5 20c.8-3.35 3.03-5.25 6.5-5.25s5.7 1.9 6.5 5.25" /></svg>;
}

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegacao principal">
      {items.map((item, index) => (
        <button className={`nav-item${index === 0 ? ' is-active' : ''}`} type="button" key={item.label} aria-current={index === 0 ? 'page' : undefined}>
          <NavIcon name={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
