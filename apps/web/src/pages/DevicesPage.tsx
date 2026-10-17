import { DeviceTable } from '@/components/DeviceTable';
import { useRouterController } from '@/controllers/use-router-controller';

export function DevicesPage() {
  const { devices, pendingAction, refreshDevices } = useRouterController();

  return (
    <DeviceTable
      devices={devices}
      onRefresh={() => void refreshDevices()}
      pendingAction={pendingAction}
    />
  );
}
