import { Clock3, Database, Router } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouterStore } from '@/stores/router.store';
import { type DeviceRefreshInterval, useSettingsStore } from '@/stores/settings.store';

const refreshOptions: Array<{ label: string; value: DeviceRefreshInterval }> = [
  { label: 'Off', value: 0 },
  { label: 'Every 30 seconds', value: 30 },
  { label: 'Every minute', value: 60 },
  { label: 'Every 2 minutes', value: 120 },
  { label: 'Every 5 minutes', value: 300 },
];

function isRefreshInterval(value: number): value is DeviceRefreshInterval {
  return refreshOptions.some((option) => option.value === value);
}

export function SettingsPage() {
  const session = useRouterStore((state) => state.session);
  const refreshInterval = useSettingsStore((state) => state.deviceRefreshInterval);
  const setRefreshInterval = useSettingsStore((state) => state.setDeviceRefreshInterval);

  function handleRefreshChange(value: string) {
    const interval = Number(value);

    if (isRefreshInterval(interval)) {
      setRefreshInterval(interval);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure Routiq behavior without changing router firmware settings.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="bg-muted mb-2 flex size-10 items-center justify-center rounded-md">
              <Clock3 aria-hidden="true" className="size-5" />
            </div>
            <CardTitle>Device refresh</CardTitle>
            <CardDescription>Choose how often Routiq reloads DHCP devices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleRefreshChange} value={String(refreshInterval)}>
              <SelectTrigger className="w-full" aria-label="Device refresh interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {refreshOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="bg-muted mb-2 flex size-10 items-center justify-center rounded-md">
              <Router aria-hidden="true" className="size-5" />
            </div>
            <CardTitle>Connected router</CardTitle>
            <CardDescription>The adapter selected by the API server.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{session?.router.name ?? 'Unknown router'}</p>
              <p className="text-muted-foreground text-xs">
                {session?.router.id ?? 'No adapter information'}
              </p>
            </div>
            <Badge variant="secondary">Server managed</Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="bg-muted mb-2 flex size-10 items-center justify-center rounded-md">
              <Database aria-hidden="true" className="size-5" />
            </div>
            <CardTitle>Stored browser data</CardTitle>
            <CardDescription>What Routiq keeps on this browser.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md border p-3">
              <p className="font-medium">Session ID</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Stored for this browser tab only. Password and CAPTCHA are never persisted.
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="font-medium">Preferences and trusted devices</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Stored locally in this browser and never sent to a third-party service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
