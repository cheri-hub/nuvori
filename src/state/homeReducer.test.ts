import { describe, expect, it } from 'vitest';
import { homeReducer, initialHomeState } from './homeReducer';

describe('homeReducer', () => {
  it('opens the check-in without requiring a mood', () => {
    const next = homeReducer(initialHomeState, { type: 'OPEN_CHECKIN' });
    expect(next.view).toBe('checkin');
    expect(next.mood).toBeUndefined();
  });

  it('starts a five-minute solo session from the recommendation', () => {
    const next = homeReducer(
      { ...initialHomeState, view: 'checkin', resistance: 4 },
      { type: 'START_SOLO', durationMinutes: 5 },
    );
    expect(next.view).toBe('active');
    expect(next.durationMinutes).toBe(5);
    expect(next.isSocial).toBe(false);
  });

  it('updates check-in values while the check-in is open', () => {
    const state = { ...initialHomeState, view: 'checkin' as const };
    const next = homeReducer(state, { type: 'SET_ENERGY', energy: 3 });
    expect(homeReducer(next, { type: 'SET_RESISTANCE', resistance: 6 }).resistance).toBe(6);
    expect(homeReducer(next, { type: 'SET_MOOD', mood: 'calmo' }).mood).toBe('calmo');
  });

  it('opens and joins a social invite without changing check-in data', () => {
    const checkIn = { ...initialHomeState, energy: 4, mood: 'focado' };
    const invite = homeReducer(checkIn, { type: 'OPEN_INVITE' });
    expect(invite.view).toBe('invite');
    expect(invite.energy).toBe(4);
    expect(homeReducer(invite, { type: 'JOIN_INVITE' }).view).toBe('active');
    expect(homeReducer(invite, { type: 'JOIN_INVITE' }).isSocial).toBe(true);
  });

  it('closes overlays back to rest without changing the recommendation', () => {
    const state = { ...initialHomeState, view: 'checkin' as const, durationMinutes: 5 };
    const next = homeReducer(state, { type: 'CLOSE_OVERLAY' });
    expect(next.view).toBe('rest');
    expect(next.durationMinutes).toBe(5);
  });

  it('transitions a normal session into the capsule reveal', () => {
    const active = { ...initialHomeState, view: 'active' as const, startedAt: 1_000 };
    const next = homeReducer(active, { type: 'END_NORMAL' });
    expect(next.view).toBe('capsule');
    expect(next.sessionOutcome).toBe('normal');
    expect(next.lineProgress).toBe(1);
  });

  it('transitions an adapted session into the capsule reveal', () => {
    const next = homeReducer({ ...initialHomeState, view: 'active' as const }, { type: 'END_ADAPTED' });
    expect(next.view).toBe('capsule');
    expect(next.sessionOutcome).toBe('adapted');
    expect(next.lineProgress).toBe(1);
  });

  it('returns an interrupted session without a reward', () => {
    const next = homeReducer({ ...initialHomeState, view: 'active' as const, lineProgress: 0.5 }, { type: 'END_INTERRUPTED' });
    expect(next.view).toBe('return');
    expect(next.sessionOutcome).toBe('interrupted');
    expect(next.lineProgress).toBe(0.5);
  });

  it('continues from a valid capsule back to rest at the completed stage', () => {
    const next = homeReducer({ ...initialHomeState, view: 'capsule' as const, sessionOutcome: 'normal', lineProgress: 1 }, { type: 'CAPSULE_CONTINUE' });
    expect(next.view).toBe('rest');
    expect(next.lineProgress).toBe(1);
    expect(next.sessionOutcome).toBeUndefined();
  });

  it('continues an interrupted return without changing the stage', () => {
    const next = homeReducer({ ...initialHomeState, view: 'return' as const, sessionOutcome: 'interrupted' }, { type: 'RETURN_CONTINUE' });
    expect(next.view).toBe('rest');
    expect(next.lineProgress).toBe(initialHomeState.lineProgress);
  });
});
