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
    const joined = homeReducer(invite, { type: 'JOIN_INVITE' });
    expect(joined.view).toBe('invite');
    expect(joined.isHost).toBe(true);
    expect(joined.isSocial).toBe(true);
    expect(joined.participant?.displayName).toBe('Lia Alves');

    const active = homeReducer(joined, { type: 'START_SOCIAL' });
    expect(active.view).toBe('active');
    expect(active.isHost).toBe(true);
  });

  it('closes overlays back to rest without changing the recommendation', () => {
    const state = { ...initialHomeState, view: 'checkin' as const, durationMinutes: 5 };
    const next = homeReducer(state, { type: 'CLOSE_OVERLAY' });
    expect(next.view).toBe('rest');
    expect(next.durationMinutes).toBe(5);
  });

  it('rejects a normal end before the deterministic session clock completes', () => {
    const active = { ...initialHomeState, view: 'active' as const, startedAt: 1_000, durationMinutes: 5 };
    const next = homeReducer(active, { type: 'END_NORMAL', endedAt: 300_999 });
    expect(next).toBe(active);
  });

  it('transitions a completed normal session into the capsule reveal', () => {
    const active = { ...initialHomeState, view: 'active' as const, startedAt: 1_000, durationMinutes: 5 };
    const next = homeReducer(active, { type: 'END_NORMAL', endedAt: 301_000 });
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
    const next = homeReducer({ ...initialHomeState, view: 'capsule' as const, sessionOutcome: 'normal', lineProgress: 1, muruStage: 3 }, { type: 'CAPSULE_CONTINUE' });
    expect(next.view).toBe('rest');
    expect(next.lineProgress).toBe(0);
    expect(next.muruStage).toBe(3);
    expect(next.sessionOutcome).toBeUndefined();
  });

  it('continues an interrupted return without changing the stage', () => {
    const next = homeReducer({ ...initialHomeState, view: 'return' as const, sessionOutcome: 'interrupted' }, { type: 'RETURN_CONTINUE' });
    expect(next.view).toBe('rest');
    expect(next.lineProgress).toBe(initialHomeState.lineProgress);
  });

  it('starts a second session with a fresh line and the persistent Muru stage', () => {
    const firstReturn = homeReducer(
      { ...initialHomeState, view: 'capsule' as const, sessionOutcome: 'adapted', lineProgress: 1, muruStage: 4, durationMinutes: 10 },
      { type: 'CAPSULE_CONTINUE' },
    );
    const checkIn = homeReducer(firstReturn, { type: 'OPEN_CHECKIN' });
    const secondSession = homeReducer(checkIn, { type: 'START_SOLO', durationMinutes: 10 });

    expect(secondSession.view).toBe('active');
    expect(secondSession.lineProgress).toBe(0);
    expect(secondSession.muruStage).toBe(4);
  });

  it.each([
    { type: 'PAUSE_SESSION', pausedAt: 2_000 } as const,
    { type: 'RESUME_SESSION', resumedAt: 3_000 } as const,
    { type: 'END_NORMAL', endedAt: 301_000 } as const,
    { type: 'END_ADAPTED' } as const,
    { type: 'END_INTERRUPTED' } as const,
  ])('rejects $type when the active user is not the host', (action) => {
    const participant = {
      ...initialHomeState,
      view: 'active' as const,
      isHost: false,
      startedAt: 1_000,
      pausedAt: action.type === 'RESUME_SESSION' ? 2_000 : undefined,
    };

    expect(homeReducer(participant, action)).toBe(participant);
  });
});
