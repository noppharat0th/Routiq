import { useMemo } from 'react';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { NetworkDevice, RouterPendingAction } from '@/models/router.model';
import { useDeviceTrustStore } from '@/stores/device-trust.store';
import { DataTable } from './data-table/DataTable';
import { deviceColumnLabels, deviceColumns } from './devices/device-columns';

interface DeviceTableProps {
  devices: NetworkDevice[];
  pendingAction: RouterPendingAction;
  onRefresh: () => void;
}

export function DeviceTable({ devices, pendingAction, onRefresh }: DeviceTableProps) {
  const deviceAliases = useDeviceTrustStore((state) => state.deviceAliases);
  const busy = pendingAction !== null;
  const refreshing = pendingAction === 'devices';
  const displayDevices = useMemo(
    () => devices.map((device) => ({ ...device, displayName: deviceAliases[device.id] })),
    [deviceAliases, devices]
  );

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CardTitle>Network Devices</CardTitle>
            <Badge variant="secondary">
              {devices.length} {devices.length === 1 ? 'device' : 'devices'}
            </Badge>
          </div>
          <CardDescription>Devices reported by DHCP in the current router session</CardDescription>
        </div>

        <Button disabled={busy} onClick={onRefresh} type="button" variant="outline">
          {refreshing ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <RefreshCw aria-hidden="true" />
          )}
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        <DataTable
          columnLabels={deviceColumnLabels}
          columns={deviceColumns}
          data={displayDevices}
          emptyMessage="No devices match your search."
          getRowId={(device) => device.id}
          searchPlaceholder="Search by name, IP address, MAC address, or interface..."
        />
      </CardContent>
    </Card>
  );
}
