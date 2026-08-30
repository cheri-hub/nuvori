export type SessionStatus = 'pending' | 'active' | 'completed' | 'adapted' | 'interrupted' | 'cancelled';
export type SessionOutcome = 'normal' | 'adapted' | 'interrupted';

export type SessionMember = {
  userId: string;
  role: 'host' | 'participant';
  displayName?: string;
};

export type RewardGrant = {
  id: string;
  userId: string;
  sessionId: string;
  capsuleType: 'journey' | 'companionship';
};

export type SessionSnapshot = {
  id: string;
  hostId: string;
  plannedSeconds: number;
  inviteTokenHash: string;
  status: SessionStatus;
  members: SessionMember[];
  rewards: RewardGrant[];
  startedAt?: number;
  endedAt?: number;
};

type CreateSessionInput = {
  id: string;
  hostId: string;
  plannedSeconds: number;
  inviteTokenHash: string;
};

type ParticipantInput = {
  userId: string;
  displayName: string;
};

export class SessionRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionRuleError';
  }
}

const allowedDurations = new Set([300, 600, 900, 1_200]);

export class InMemorySessionRepository {
  private readonly sessions = new Map<string, SessionSnapshot>();

  createSession(input: CreateSessionInput): SessionSnapshot {
    if (!allowedDurations.has(input.plannedSeconds)) {
      throw new SessionRuleError('plannedSeconds must be 300, 600, 900, or 1200');
    }
    if (this.sessions.has(input.id)) {
      throw new SessionRuleError('session already exists');
    }

    const session: SessionSnapshot = {
      id: input.id,
      hostId: input.hostId,
      plannedSeconds: input.plannedSeconds,
      inviteTokenHash: input.inviteTokenHash,
      status: 'pending',
      members: [{ userId: input.hostId, role: 'host' }],
      rewards: [],
    };
    this.sessions.set(session.id, session);
    return session;
  }

  joinSession(sessionId: string, participant: ParticipantInput): SessionSnapshot {
    const session = this.getSession(sessionId);
    this.assertStatus(session, 'pending');
    if (session.members.some((member) => member.userId === participant.userId)) {
      throw new SessionRuleError('user is already a session member');
    }
    if (session.members.length >= 2) {
      throw new SessionRuleError('social session already has two members');
    }

    session.members.push({
      userId: participant.userId,
      role: 'participant',
      displayName: participant.displayName,
    });
    return session;
  }

  startSession(sessionId: string, actorId: string, startedAt: number): SessionSnapshot {
    const session = this.getSession(sessionId);
    this.assertStatus(session, 'pending');
    this.assertHost(session, actorId);
    if (session.members.length < 2) {
      throw new SessionRuleError('social session needs a participant before starting');
    }

    session.status = 'active';
    session.startedAt = startedAt;
    return session;
  }

  endSession(
    sessionId: string,
    actorId: string,
    outcome: SessionOutcome,
    endedAt: number,
  ): SessionSnapshot {
    const session = this.getSession(sessionId);
    if (session.status !== 'active') {
      if (session.status === 'completed' || session.status === 'adapted' || session.status === 'interrupted' || session.status === 'cancelled') {
        this.assertHost(session, actorId);
        return session;
      }
      this.assertStatus(session, 'active');
    }
    this.assertHost(session, actorId);
    if (outcome === 'normal' && (session.startedAt === undefined || endedAt < session.startedAt + session.plannedSeconds * 1_000)) {
      throw new SessionRuleError('normal completion requires the planned duration');
    }

    session.endedAt = endedAt;
    session.status = outcome === 'normal' ? 'completed' : outcome;
    if (outcome === 'normal' || outcome === 'adapted') {
      session.rewards = session.members.map((member, index) => ({
        id: `${session.id}-reward-${index + 1}`,
        userId: member.userId,
        sessionId: session.id,
        capsuleType: outcome === 'adapted' ? 'companionship' : 'journey',
      }));
    }
    return session;
  }

  private getSession(sessionId: string): SessionSnapshot {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new SessionRuleError('session not found');
    }
    return session;
  }

  private assertHost(session: SessionSnapshot, actorId: string): void {
    if (session.hostId !== actorId) {
      throw new SessionRuleError('only the host can change session state');
    }
  }

  private assertStatus(session: SessionSnapshot, expected: SessionStatus): void {
    if (session.status !== expected) {
      throw new SessionRuleError(`session must be ${expected}`);
    }
  }
}
