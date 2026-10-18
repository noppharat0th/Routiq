import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DeviceTrustStore {
  trustedDeviceIds: string[];
  deviceAliases: Record<string, string>;
  setTrusted: (deviceId: string, trusted: boolean) => void;
  setAlias: (deviceId: string, alias: string) => void;
}

export const useDeviceTrustStore = create<DeviceTrustStore>()(
  persist(
    (set) => ({
      trustedDeviceIds: [],
      deviceAliases: {},
      setTrusted: (deviceId, trusted) =>
        set((state) => ({
          trustedDeviceIds: trusted
            ? [...new Set([...state.trustedDeviceIds, deviceId])]
            : state.trustedDeviceIds.filter((id) => id !== deviceId),
        })),
      setAlias: (deviceId, alias) =>
        set((state) => {
          const normalizedAlias = alias.trim();
          const deviceAliases = { ...state.deviceAliases };

          if (normalizedAlias) {
            deviceAliases[deviceId] = normalizedAlias;
          } else {
            delete deviceAliases[deviceId];
          }

          return { deviceAliases };
        }),
    }),
    { name: 'routiq.device-trust' }
  )
);
