import { describe, expect, it } from 'vitest';
import { InMemorySessionRepository, SessionRuleError } from './sessionRepository';

describe('InMemorySessionRepository', () => {
  it('creates a pending session with the host as its first member', () => {
    const repository = new InMemorySessionRepository();

    const session = repository.createSession({
      id: 'session-1',
      hostId: 'user-host',
      plannedSeconds: 300,
      inviteTokenHash: 'hash-1',
    });

    expect(session.status).toBe('pending');
    expect(session.members).toEqual([
      { userId: 'user-host', role: 'host' },
    ]);
  });

  it('allows a participant to join and the host to start', () => {
    const repository = new InMemorySessionRepository();
    repository.createSession({
      id: 'session-1',
      hostId: 'user-host',
      plannedSeconds: 300,
      inviteTokenHash: 'hash-1',
    });

    repository.joinSession('session-1', { userId: 'user-participant', displayName: 'Lia Alves' });
    const active = repository.startSession('session-1', 'user-host', 1_000);

    expect(active.status).toBe('active');
    expect(active.startedAt).toBe(1_000);
    expect(active.members).toContainEqual({
      userId: 'user-participant',
      role: 'participant',
      displayName: 'Lia Alves',
    });
  });

  it('rejects participant lifecycle commands and premature normal completion', () => {
    const repository = new InMemorySessionRepository();
    repository.createSession({
      id: 'session-1',
      hostId: 'user-host',
      plannedSeconds: 300,
      inviteTokenHash: 'hash-1',
    });
    repository.joinSession('session-1', { userId: 'user-participant', displayName: 'Lia Alves' });
    repository.startSession('session-1', 'user-host', 1_000);

    expect(() => repository.endSession('session-1', 'user-participant', 'adapted', 2_000))
      .toThrow(SessionRuleError);
    expect(() => repository.endSession('session-1', 'user-host', 'normal', 2_000))
      .toThrow(SessionRuleError);
  });

  it('grants one reward for a valid ending even when the end request repeats', () => {
    const repository = new InMemorySessionRepository();
    repository.createSession({
      id: 'session-1',
      hostId: 'user-host',
      plannedSeconds: 300,
      inviteTokenHash: 'hash-1',
    });
    repository.joinSession('session-1', { userId: 'user-participant', displayName: 'Lia Alves' });
    repository.startSession('session-1', 'user-host', 1_000);

    const first = repository.endSession('session-1', 'user-host', 'normal', 301_000);
    const repeated = repository.endSession('session-1', 'user-host', 'normal', 301_000);

    expect(first).toBe(repeated);
    expect(first.status).toBe('completed');
    expect(first.rewards).toHaveLength(2);
    expect(new Set(first.rewards.map((reward) => reward.userId)).size).toBe(2);
  });

  it('records an interrupted ending without granting a reward', () => {
    const repository = new InMemorySessionRepository();
    repository.createSession({
      id: 'session-1',
      hostId: 'user-host',
      plannedSeconds: 300,
      inviteTokenHash: 'hash-1',
    });
    repository.joinSession('session-1', { userId: 'user-participant', displayName: 'Lia Alves' });
    repository.startSession('session-1', 'user-host', 1_000);

    const interrupted = repository.endSession('session-1', 'user-host', 'interrupted', 2_000);
    const repeated = repository.endSession('session-1', 'user-host', 'interrupted', 2_000);

    expect(interrupted.status).toBe('interrupted');
    expect(interrupted.rewards).toEqual([]);
    expect(repeated).toBe(interrupted);
  });
});
