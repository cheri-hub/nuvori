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
};

export type HomeAction =
  | { type: 'OPEN_CHECKIN' }
  | { type: 'SET_ENERGY'; energy: number }
  | { type: 'SET_RESISTANCE'; resistance: number }
  | { type: 'SET_MOOD'; mood?: string }
  | { type: 'START_SOLO'; durationMinutes: number }
  | { type: 'OPEN_INVITE' }
  | { type: 'JOIN_INVITE' }
  | { type: 'CLOSE_OVERLAY' };

export const initialHomeState: HomeState = {
  view: 'rest',
  durationMinutes: 5,
  energy: undefined,
  resistance: undefined,
  mood: undefined,
  isSocial: false,
  lineProgress: 0.34,
  sessionOutcome: undefined,
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
        ? { ...state, view: 'active', durationMinutes: action.durationMinutes, isSocial: false }
        : state;
    case 'OPEN_INVITE':
      return state.view === 'rest' ? { ...state, view: 'invite' } : state;
    case 'JOIN_INVITE':
      return state.view === 'invite' ? { ...state, view: 'active', isSocial: true } : state;
    case 'CLOSE_OVERLAY':
      return state.view === 'checkin' || state.view === 'invite' ? { ...state, view: 'rest' } : state;
    default:
      return state;
  }
}
