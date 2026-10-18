import { create } from 'zustand';
import type {
  NetworkDevice,
  RouterDosSettings,
  RouterFirewallSettings,
  RouterNetworkInsights,
  RouterPendingAction,
  RouterSession,
  RouterStatus,
} from '@/models/router.model';

interface RouterState {
  session: RouterSession | null;
  authenticated: boolean;
  devices: NetworkDevice[];
  status: RouterStatus | null;
  networkInsights: RouterNetworkInsights | null;
  pendingAction: RouterPendingAction;
  error: string | null;
}

interface RouterStoreActions {
  setSession: (session: RouterSession) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setDevices: (devices: NetworkDevice[]) => void;
  setStatus: (status: RouterStatus) => void;
  setNetworkInsights: (insights: RouterNetworkInsights) => void;
  setFirewallSettings: (settings: RouterFirewallSettings) => void;
  setDosSettings: (settings: RouterDosSettings) => void;
  beginRequest: (action: Exclude<RouterPendingAction, null>) => void;
  endRequest: () => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

const initialState: RouterState = {
  session: null,
  authenticated: false,
  devices: [],
  status: null,
  networkInsights: null,
  pendingAction: null,
  error: null,
};

export const useRouterStore = create<RouterState & RouterStoreActions>((set) => ({
  ...initialState,

  setSession: (session) =>
    set({
      session,
      authenticated: false,
      devices: [],
      status: null,
      networkInsights: null,
      error: null,
    }),

  setAuthenticated: (authenticated) => set({ authenticated }),

  setDevices: (devices) => set({ devices }),

  setStatus: (status) => set({ status }),

  setNetworkInsights: (networkInsights) => set({ networkInsights }),

  setFirewallSettings: (settings) =>
    set((state) => {
      if (!state.status) return state;

      return {
        status: {
          ...state.status,
          security: {
            ...state.status.security,
            firewallEnabled: settings.enabled,
            firewallLevel: settings.level,
          },
        },
      };
    }),

  setDosSettings: (settings) =>
    set((state) => {
      if (!state.status) return state;

      return {
        status: {
          ...state.status,
          security: {
            ...state.status.security,
            dosProtectionEnabled: settings.enabled,
            dosThreshold: settings.threshold,
          },
        },
      };
    }),

  beginRequest: (pendingAction) => set({ pendingAction, error: null }),

  endRequest: () => set({ pendingAction: null }),

  setError: (error) => set({ error, pendingAction: null }),

  reset: () => set(initialState),
}));
