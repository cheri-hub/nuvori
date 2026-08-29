import { useSessionClock } from '../hooks/useSessionClock';

export type HomeView = 'rest' | 'checkin' | 'invite' | 'active' | 'capsule' | 'return';

export type PublicParticipant = {
  displayName: string;
  avatarInitials: string;
};

export type HomeState = {
  view: HomeView;
  durationMinutes: number;
  energy?: number;
  resistance?: number;
  mood?: string;
  isSocial: boolean;
  isHost: boolean;
  participant?: PublicParticipant;
  muruStage: number;
  lineProgress: number;
  sessionOutcome?: string;
  startedAt?: number;
  pausedAt?: number;
  pausedSeconds: number;
};

export type HomeAction =
  | { type: 'OPEN_CHECKIN' }
  | { type: 'SET_ENERGY'; energy: number }
  | { type: 'SET_RESISTANCE'; resistance: number }
  | { type: 'SET_MOOD'; mood?: string }
  | { type: 'START_SOLO'; durationMinutes: number }
  | { type: 'OPEN_INVITE' }
  | { type: 'JOIN_INVITE' }
  | { type: 'START_SOCIAL' }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'PAUSE_SESSION'; pausedAt: number }
  | { type: 'RESUME_SESSION'; resumedAt: number }
  | { type: 'END_NORMAL'; endedAt: number }
  | { type: 'END_ADAPTED' }
  | { type: 'END_INTERRUPTED' }
  | { type: 'RETURN_CONTINUE' }
  | { type: 'CAPSULE_CONTINUE' };

export const initialHomeState: HomeState = {
  view: 'rest',
  durationMinutes: 5,
  energy: undefined,
  resistance: undefined,
  mood: undefined,
  isSocial: false,
  isHost: true,
  participant: undefined,
  muruStage: 1,
  lineProgress: 0,
  sessionOutcome: undefined,
  pausedSeconds: 0,
};

const durations = new Set([5, 10, 15, 20]);

export function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case 'OPEN_CHECKIN':
      return state.view === 'rest' ? { ...state, view: 'checkin' } : state;
    case 'SET_ENERGY':
      return state.view === 'checkin' && action.energy >= 1 && action.energy <= 5
        ? { ...state, energy: action.energy }
        : state;
    case 'SET_RESISTANCE':
      return state.view === 'checkin' && action.resistance >= 1 && action.resistance <= 10
        ? { ...state, resistance: action.resistance }
        : state;
    case 'SET_MOOD':
      return state.view === 'checkin' ? { ...state, mood: action.mood || undefined } : state;
    case 'START_SOLO':
      return state.view === 'checkin' && durations.has(action.durationMinutes)
        ? { ...state, view: 'active', durationMinutes: action.durationMinutes, isSocial: false, isHost: true, participant: undefined, lineProgress: 0, startedAt: Date.now(), pausedAt: undefined, pausedSeconds: 0, sessionOutcome: undefined }
        : state;
    case 'OPEN_INVITE':
      return state.view === 'rest' ? { ...state, view: 'invite', isHost: true, participant: undefined } : state;
    case 'JOIN_INVITE':
      return state.view === 'invite' && state.isHost
        ? { ...state, isSocial: true, participant: { displayName: 'Lia Alves', avatarInitials: 'LA' } }
        : state;
    case 'START_SOCIAL':
      return state.view === 'invite' && state.isHost && state.participant
        ? { ...state, view: 'active', isSocial: true, lineProgress: 0, startedAt: Date.now(), pausedAt: undefined, pausedSeconds: 0, sessionOutcome: undefined }
        : state;
    case 'CLOSE_OVERLAY':
      return state.view === 'checkin' || state.view === 'invite' ? { ...state, view: 'rest' } : state;
    case 'PAUSE_SESSION':
      return state.view === 'active' && state.isHost && state.pausedAt === undefined ? { ...state, pausedAt: action.pausedAt } : state;
    case 'RESUME_SESSION':
      return state.view === 'active' && state.isHost && state.pausedAt !== undefined
        ? { ...state, pausedAt: undefined, pausedSeconds: state.pausedSeconds + Math.max(0, action.resumedAt - state.pausedAt) / 1000 }
        : state;
    case 'END_NORMAL': {
      const isComplete = state.startedAt !== undefined && useSessionClock({
        startedAt: state.startedAt,
        durationSeconds: state.durationMinutes * 60,
        pausedAt: state.pausedAt,
        pausedSeconds: state.pausedSeconds,
        now: action.endedAt,
      }).isComplete;
      return state.view === 'active' && state.isHost && isComplete
        ? { ...state, view: 'capsule', sessionOutcome: 'normal', lineProgress: 1 }
        : state;
    }
    case 'END_ADAPTED':
      return state.view === 'active' && state.isHost
        ? { ...state, view: 'capsule', sessionOutcome: 'adapted', lineProgress: 1 }
        : state;
    case 'END_INTERRUPTED':
      return state.view === 'active' && state.isHost ? { ...state, view: 'return', sessionOutcome: 'interrupted' } : state;
    case 'RETURN_CONTINUE':
      return state.view === 'return'
        ? { ...state, view: 'rest', isSocial: false, participant: undefined, lineProgress: 0, sessionOutcome: undefined, startedAt: undefined, pausedAt: undefined, pausedSeconds: 0 }
        : state;
    case 'CAPSULE_CONTINUE':
      return state.view === 'capsule' && (state.sessionOutcome === 'normal' || state.sessionOutcome === 'adapted')
        ? { ...state, view: 'rest', isSocial: false, participant: undefined, lineProgress: 0, sessionOutcome: undefined, startedAt: undefined, pausedAt: undefined, pausedSeconds: 0 }
        : state;
    default:
      return state;
  }
}
