import { describe, expect, it } from 'vitest';
import { isSevenDayReturn } from './retention';

describe('seven-day return rule', () => {
  it('counts a new session started within seven days as a return', () => {
    expect(isSevenDayReturn(1_000, 1_000 + 7 * 24 * 60 * 60 * 1_000)).toBe(true);
  });

  it('counts the return when the new session is later interrupted', () => {
    const startedAt = 1_000 + 2 * 24 * 60 * 60 * 1_000;

    expect(isSevenDayReturn(1_000, startedAt)).toBe(true);
  });

  it('does not count the original session or a session outside the window', () => {
    expect(isSevenDayReturn(1_000, 1_000)).toBe(false);
    expect(isSevenDayReturn(1_000, 1_000 + 7 * 24 * 60 * 60 * 1_000 + 1)).toBe(false);
  });
});
