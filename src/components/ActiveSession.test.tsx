import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ActiveSession } from './ActiveSession';
import { initialHomeState, type HomeState } from '../state/homeReducer';

const activeState = (isHost: boolean): HomeState => ({
  ...initialHomeState,
  view: 'active',
  isHost,
  startedAt: 1_000,
});

describe('ActiveSession host controls', () => {
  it('shows host controls only to the host while participants retain the session view', () => {
    const dispatch = () => undefined;
    const { rerender } = render(<ActiveSession state={activeState(true)} dispatch={dispatch} />);
    expect(screen.getByRole('group', { name: 'Controles do anfitriao' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeVisible();

    rerender(<ActiveSession state={activeState(false)} dispatch={dispatch} />);
    expect(screen.getByRole('img', { name: 'Muru, seu companheiro de jornada' })).toBeVisible();
    expect(screen.getByLabelText(/segundos restantes/i)).toBeVisible();
    expect(screen.queryByRole('group', { name: 'Controles do anfitriao' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Pausar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Encerrar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Hoje esta dificil' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Preciso parar por hoje' })).toBeNull();
  });
});
