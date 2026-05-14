import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Pet, Couple } from './types';

interface AppState {
  couple: Couple | null;
  pet: Pet | null;
  connected: boolean;
  userName: string;
  partnerName: string;
}

type Action =
  | { type: 'SET_COUPLE'; payload: Couple }
  | { type: 'SET_PET'; payload: Pet }
  | { type: 'UPDATE_PET'; payload: Partial<Pet> }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'SET_PARTNER_NAME'; payload: string };

const initialState: AppState = {
  couple: null,
  pet: null,
  connected: false,
  userName: '',
  partnerName: '',
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_COUPLE':
      return { ...state, couple: action.payload };
    case 'SET_PET':
      return { ...state, pet: action.payload };
    case 'UPDATE_PET':
      return { ...state, pet: state.pet ? { ...state.pet, ...action.payload } : null };
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };
    case 'SET_USER_NAME':
      return { ...state, userName: action.payload };
    case 'SET_PARTNER_NAME':
      return { ...state, partnerName: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
