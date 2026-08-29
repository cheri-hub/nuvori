import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActiveSession } from './ActiveSession';
import { initialHomeState, type HomeState } from '../state/homeReducer';

const activeState = (isHost: boolean): HomeState => ({
  ...initialHomeState,
  view: 'active',
  isHost,
  startedAt: 1_000,
});

afterEach(() => vi.useRealTimers());

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

  it('enables normal completion only after the displayed clock reaches zero', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(300_999));
    const dispatch = vi.fn();
    const { rerender } = render(<ActiveSession state={{ ...activeState(true), durationMinutes: 5 }} dispatch={dispatch} />);
    expect(screen.getByRole('button', { name: 'Encerrar' })).toBeDisabled();

    rerender(<ActiveSession state={{ ...activeState(true), durationMinutes: 5, startedAt: 1_000 }} dispatch={dispatch} />);
    vi.setSystemTime(new Date(301_000));
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByRole('button', { name: 'Encerrar' })).toBeEnabled();
  });
});
