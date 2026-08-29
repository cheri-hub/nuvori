import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';

export function HomeShell({ children, hideBottomNav = false }: { children: ReactNode; hideBottomNav?: boolean }) {
  return (
    <main className="home-shell" id="home">
      <AppHeader />
      <section className="home-content">{children}</section>
      {!hideBottomNav && <BottomNav />}
    </main>
  );
}
