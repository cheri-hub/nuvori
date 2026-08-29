import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('renders the local Muru scene with accessible text and an incomplete first-step line', () => {
    render(<App />);
    expect(screen.getByRole('img', { name: /Muru, seu companheiro de jornada/i })).toHaveAttribute('src', '/assets/muru-idle.svg');
    const line = screen.getByRole('img', { name: 'Primeiro passo' });
    const track = line.querySelector('.line-track');
    const lit = line.querySelector('.line-lit');
    expect(line).toHaveAttribute('data-line-progress', '0');
    expect(track).toBeTruthy();
    expect(lit).toHaveAttribute('pathLength', '1');
    expect(lit).toHaveAttribute('data-line-progress', '0');
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

  it('opens check-in from the primary CTA and starts a five-minute session', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Comecar 5 min/i }));
    expect(screen.getByRole('dialog', { name: /check-in/i })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Comecar 5 min/i }));
    expect(screen.getByText(/sessao em andamento/i)).toBeVisible();
  });

  it('closes check-in back to rest without changing the five-minute recommendation', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Comecar 5 min/i }));
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /Comecar 5 min/i })).toBeVisible();
  });

  it('opens the invite sheet from the secondary action and closes it to rest', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Convidar alguem/i }));
    expect(screen.getByRole('dialog', { name: /convidar alguem/i })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /Comecar 5 min/i })).toBeVisible();
  });

  it('keeps a custom duration in the Home recommendation after a valid session', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Comecar 5 min/i }));
    fireEvent.click(screen.getByRole('button', { name: '10 minutos' }));
    fireEvent.click(screen.getByRole('button', { name: /Comecar 10 min/i }));
    fireEvent.click(screen.getByRole('button', { name: /Hoje esta dificil/i }));
    fireEvent.click(screen.getByRole('button', { name: /Voltar ao inicio/i }));

    expect(screen.getByRole('button', { name: /Comecar 10 min/i })).toBeVisible();
    expect(screen.getByText(/Dez minutos para voltar para voce/i)).toBeVisible();
  });

  it('keeps the inviter as host while a public participant joins before the session starts', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Convidar alguem/i }));
    fireEvent.click(screen.getByRole('button', { name: /Simular entrada de participante/i }));

    expect(screen.getByText('Lia Alves')).toBeVisible();
    expect(screen.getByLabelText(/Avatar publico de Lia Alves/i)).toBeVisible();
    expect(screen.queryByRole('group', { name: /Controles do anfitriao/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Comecar sessao com Lia/i }));
    expect(screen.getByRole('group', { name: /Controles do anfitriao/i })).toBeVisible();
  });
});
