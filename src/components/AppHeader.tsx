export function AppHeader() {
  return (
    <header className="app-header">
      <a className="wordmark" href="#home" aria-label="Nuvori home">NUVORI</a>
      <button className="icon-button" type="button" aria-label="Abrir perfil" title="Perfil">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 20c.8-3.35 3.03-5.25 6.5-5.25s5.7 1.9 6.5 5.25" />
        </svg>
      </button>
    </header>
  );
}
