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
    expect(line).toHaveAttribute('data-line-progress', '0.34');
    expect(line.querySelector('.line-lit')).toBeTruthy();
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
