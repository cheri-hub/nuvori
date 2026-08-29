export type HomeView = 'rest' | 'checkin' | 'invite' | 'active' | 'capsule' | 'return';

export type HomeState = {
  view: HomeView;
  durationMinutes: number;
  energy?: number;
  resistance?: number;
  mood?: string;
  isSocial: boolean;
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
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'PAUSE_SESSION'; pausedAt: number }
  | { type: 'RESUME_SESSION'; resumedAt: number }
  | { type: 'END_NORMAL' }
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
  lineProgress: 0.34,
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
        ? { ...state, view: 'active', durationMinutes: action.durationMinutes, isSocial: false, startedAt: Date.now(), pausedAt: undefined, pausedSeconds: 0, sessionOutcome: undefined }
        : state;
    case 'OPEN_INVITE':
      return state.view === 'rest' ? { ...state, view: 'invite' } : state;
    case 'JOIN_INVITE':
      return state.view === 'invite' ? { ...state, view: 'active', isSocial: true, startedAt: Date.now(), pausedAt: undefined, pausedSeconds: 0, sessionOutcome: undefined } : state;
    case 'CLOSE_OVERLAY':
      return state.view === 'checkin' || state.view === 'invite' ? { ...state, view: 'rest' } : state;
    case 'PAUSE_SESSION':
      return state.view === 'active' && state.pausedAt === undefined ? { ...state, pausedAt: action.pausedAt } : state;
    case 'RESUME_SESSION':
      return state.view === 'active' && state.pausedAt !== undefined
        ? { ...state, pausedAt: undefined, pausedSeconds: state.pausedSeconds + Math.max(0, action.resumedAt - state.pausedAt) / 1000 }
        : state;
    case 'END_NORMAL':
    case 'END_ADAPTED':
      return state.view === 'active'
        ? { ...state, view: 'capsule', sessionOutcome: action.type === 'END_NORMAL' ? 'normal' : 'adapted', lineProgress: 1 }
        : state;
    case 'END_INTERRUPTED':
      return state.view === 'active' ? { ...state, view: 'return', sessionOutcome: 'interrupted' } : state;
    case 'RETURN_CONTINUE':
      return state.view === 'return' ? { ...state, view: 'rest', sessionOutcome: undefined } : state;
    case 'CAPSULE_CONTINUE':
      return state.view === 'capsule' && (state.sessionOutcome === 'normal' || state.sessionOutcome === 'adapted')
        ? { ...state, view: 'rest', sessionOutcome: undefined }
        : state;
    default:
      return state;
  }
}
