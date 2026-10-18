import { useEffect } from 'react';
import { useRouterController } from '@/controllers/use-router-controller';
import { useSettingsStore } from '@/stores/settings.store';

export function useDeviceAutoRefresh() {
  const refreshInterval = useSettingsStore((state) => state.deviceRefreshInterval);
  const { refreshDevices } = useRouterController();

  useEffect(() => {
    if (refreshInterval === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshDevices();
    }, refreshInterval * 1_000);

    return () => window.clearInterval(timer);
  }, [refreshDevices, refreshInterval]);
}
