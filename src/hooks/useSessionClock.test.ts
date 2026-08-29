import { describe, expect, it } from 'vitest';
import { useSessionClock } from './useSessionClock';

describe('useSessionClock', () => {
  it('derives remaining time from timestamps', () => {
    expect(useSessionClock({
      startedAt: 1_000,
      durationSeconds: 300,
      pausedAt: undefined,
      pausedSeconds: 0,
      now: 61_000,
    }).remainingSeconds).toBe(240);
  });

  it('does not advance while paused', () => {
    expect(useSessionClock({
      startedAt: 1_000,
      durationSeconds: 300,
      pausedAt: 61_000,
      pausedSeconds: 0,
      now: 121_000,
    }).remainingSeconds).toBe(240);
  });

  it('clamps completion and progress to their valid bounds', () => {
    const result = useSessionClock({
      startedAt: 1_000,
      durationSeconds: 60,
      pausedAt: undefined,
      pausedSeconds: 0,
      now: 100_000,
    });
    expect(result.remainingSeconds).toBe(0);
    expect(result.progress).toBe(1);
    expect(result.isComplete).toBe(true);
  });
});
