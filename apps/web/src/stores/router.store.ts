import { create } from 'zustand';
import type { NetworkDevice, RouterPendingAction, RouterSession } from '@/models/router.model';

interface RouterState {
  session: RouterSession | null;
  authenticated: boolean;
  devices: NetworkDevice[];
  pendingAction: RouterPendingAction;
  error: string | null;
}

interface RouterStoreActions {
  setSession: (session: RouterSession) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setDevices: (devices: NetworkDevice[]) => void;
  beginRequest: (action: Exclude<RouterPendingAction, null>) => void;
  endRequest: () => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

const initialState: RouterState = {
  session: null,
  authenticated: false,
  devices: [],
  pendingAction: null,
  error: null,
};

export const useRouterStore = create<RouterState & RouterStoreActions>((set) => ({
  ...initialState,

  setSession: (session) => set({ session, authenticated: false, devices: [], error: null }),

  setAuthenticated: (authenticated) => set({ authenticated }),

  setDevices: (devices) => set({ devices }),

  beginRequest: (pendingAction) => set({ pendingAction, error: null }),

  endRequest: () => set({ pendingAction: null }),

  setError: (error) => set({ error, pendingAction: null }),

  reset: () => set(initialState),
}));
