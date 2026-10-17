import { Laptop, LoaderCircle, LogOut, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { NetworkDevice, RouterPendingAction } from '@/models/router.model';

interface DeviceTableProps {
  devices: NetworkDevice[];
  pendingAction: RouterPendingAction;
  onRefresh: () => void;
  onDisconnect: () => void;
}

function formatLease(seconds: number | null): string {
  if (seconds === null) {
    return '-';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }

  return `${minutes} min`;
}

export function DeviceTable({ devices, pendingAction, onRefresh, onDisconnect }: DeviceTableProps) {
  const busy = pendingAction !== null;
  const refreshing = pendingAction === 'devices';
  const disconnecting = pendingAction === 'logout';

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
          <CardDescription>Devices reported by DHCP in the current router session.</CardDescription>
        </div>

        <div className="flex gap-2">
          <Button disabled={busy} onClick={onRefresh} type="button" variant="outline">
            {refreshing ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <RefreshCw aria-hidden="true" />
            )}
            Refresh
          </Button>
          <Button disabled={busy} onClick={onDisconnect} type="button" variant="destructive">
            {disconnecting ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <LogOut aria-hidden="true" />
            )}
            Sign out
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>Interface</TableHead>
                <TableHead className="text-right">Lease Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell className="h-32 text-center" colSpan={5}>
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                      <Laptop aria-hidden="true" className="size-6" />
                      No devices reported by DHCP.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.name || 'Unknown device'}</TableCell>
                    <TableCell>{device.ipAddress || '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{device.macAddress}</TableCell>
                    <TableCell>
                      {device.interfaceName ? (
                        <Badge variant="outline">{device.interfaceName}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatLease(device.leaseRemainingSeconds)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
