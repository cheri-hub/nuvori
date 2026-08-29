import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';

afterEach(cleanup);

describe('Home shell', () => {
  it('shows the product, direct start action, and secondary social action', () => {
    render(<App />);
    expect(screen.getByText('NUVORI')).toBeVisible();
    expect(screen.getByRole('button', { name: /Comecar 5 min/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Convidar alguem/i })).toBeVisible();
  });

  it('renders the local Muru scene with accessible text and a partial first-step line', () => {
    render(<App />);
    expect(screen.getByRole('img', { name: /Muru, seu companheiro de jornada/i })).toHaveAttribute('src', '/assets/muru-idle.svg');
    const line = screen.getByRole('img', { name: 'Primeiro passo' });
    const track = line.querySelector('.line-track');
    const lit = line.querySelector('.line-lit');
    expect(line).toHaveAttribute('data-line-progress', '0.34');
    expect(track).toBeTruthy();
    expect(lit).toHaveAttribute('pathLength', '1');
    expect(lit).toHaveAttribute('data-line-progress', '0.34');
    expect(Number(lit?.getAttribute('data-line-progress'))).toBeGreaterThan(0);
    expect(Number(lit?.getAttribute('data-line-progress'))).toBeLessThan(1);
    expect(track).not.toHaveAttribute('data-line-progress');
  });

  it('keeps the expected shell hierarchy and profile affordance', () => {
    render(<App />);
    const shell = document.querySelector('.home-shell');
    expect(shell).toBeTruthy();
    expect(shell?.querySelector('.app-header')).toBeTruthy();
    expect(shell?.querySelector('.home-content')).toBeTruthy();
    expect(shell?.querySelector('.home-content .scene-wrap .muru-scene')).toBeTruthy();
    expect(shell?.querySelector('.bottom-nav')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Abrir perfil' })).toBeVisible();
  });

  it('provides the four primary navigation destinations', () => {
    render(<App />);
    for (const label of ['Home', 'Missao', 'Colecao', 'Perfil']) {
      expect(screen.getByRole('button', { name: label })).toBeVisible();
    }
  });

  it('keeps the home surface free of dashboard and promotional UI', () => {
    render(<App />);
    expect(document.querySelector('.hero-card, .streak-meter, .fitness-metrics, [style*="gradient"]')).toBeNull();
    expect(screen.queryByText(/streak|calorias|passos|fitness|metricas/i)).toBeNull();
  });
});
