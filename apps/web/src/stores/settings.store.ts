import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DeviceRefreshInterval = 0 | 30 | 60 | 120 | 300;

interface SettingsStore {
  deviceRefreshInterval: DeviceRefreshInterval;
  setDeviceRefreshInterval: (interval: DeviceRefreshInterval) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      deviceRefreshInterval: 60,
      setDeviceRefreshInterval: (deviceRefreshInterval) => set({ deviceRefreshInterval }),
    }),
    { name: 'routiq.preferences' }
  )
);
