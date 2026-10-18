import { Activity, Globe2, RadioTower, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RouterStatus } from '@/models/router.model';

interface RouterStatusOverviewProps {
  status: RouterStatus | null;
}

function display(value: string | number | null, suffix = ''): string {
  return value === null ? 'Unavailable' : `${value}${suffix}`;
}

function formatDuration(totalSeconds: number | null): string {
  if (totalSeconds === null) {
    return 'Unavailable';
  }

  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);

  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`;
}

function UsageBar({ label, value }: { label: string; value: number | null }) {
  const normalizedValue = value === null ? 0 : Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>{display(value, '%')}</span>
      </div>
      <div
        aria-label={`${label} usage`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value ?? undefined}
        className="bg-muted h-1.5 overflow-hidden rounded-full"
        role="progressbar"
      >
        <div className="bg-primary h-full rounded-full" style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  );
}

export function RouterStatusOverview({ status }: RouterStatusOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Internet</CardTitle>
          <Globe2 aria-hidden="true" className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant={status?.internet.connected ? 'default' : 'secondary'}>
            {status ? (status.internet.connected ? 'Online' : 'Offline') : 'Loading'}
          </Badge>
          <div className="space-y-1 text-sm">
            <p>{status?.internet.ipv4Address ?? 'No IPv4 address'}</p>
            <p className="text-muted-foreground text-xs">
              ↓ {status?.internet.downloadRate ?? '—'} · ↑ {status?.internet.uploadRate ?? '—'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">System health</CardTitle>
          <Activity aria-hidden="true" className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <UsageBar label="CPU" value={status?.system.cpuUsagePercent ?? null} />
          <UsageBar label="Memory" value={status?.system.memoryUsagePercent ?? null} />
          <UsageBar label="Flash" value={status?.system.flashUsagePercent ?? null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Optical link</CardTitle>
          <RadioTower aria-hidden="true" className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge
            variant={
              status?.optical.registered && !status.optical.lossOfSignal ? 'default' : 'secondary'
            }
          >
            {status
              ? status.optical.registered && !status.optical.lossOfSignal
                ? 'Registered'
                : 'Check signal'
              : 'Loading'}
          </Badge>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Receive</p>
              <p>{display(status?.optical.receivePowerDbm ?? null, ' dBm')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Transmit</p>
              <p>{display(status?.optical.transmitPowerDbm ?? null, ' dBm')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Temperature</p>
              <p>{display(status?.optical.temperatureCelsius ?? null, ' °C')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Online</p>
              <p>{formatDuration(status?.optical.onlineSeconds ?? null)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Wi-Fi</CardTitle>
          <Wifi aria-hidden="true" className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-2xl font-semibold">
            {status ? status.wifiNetworks.filter((network) => network.enabled).length : '—'}
          </p>
          <div className="space-y-1">
            {status?.wifiNetworks.slice(0, 3).map((network) => (
              <div className="flex items-center justify-between gap-2 text-xs" key={network.id}>
                <span className="truncate">{network.name ?? 'Unnamed network'}</span>
                <Badge variant={network.enabled ? 'outline' : 'secondary'}>
                  {network.enabled ? 'On' : 'Off'}
                </Badge>
              </div>
            ))}
            {!status?.wifiNetworks.length && (
              <p className="text-muted-foreground text-xs">Status unavailable</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
