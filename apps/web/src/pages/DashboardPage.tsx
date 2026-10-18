import { Network, Waypoints } from 'lucide-react';
import { Link } from 'react-router';
import { RouterStatusOverview } from '@/components/RouterStatusOverview';
import { SpeedTestCard } from '@/components/SpeedTestCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { routes } from '@/routes/route-paths';
import { useDeviceTrustStore } from '@/stores/device-trust.store';
import { useRouterStore } from '@/stores/router.store';

export function DashboardPage() {
  const devices = useRouterStore((state) => state.devices);
  const session = useRouterStore((state) => state.session);
  const status = useRouterStore((state) => state.status);
  const deviceAliases = useDeviceTrustStore((state) => state.deviceAliases);
  const namedDevices = devices.filter((device) => device.name).length;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Current router session and network overview.
        </p>
      </div>

      <RouterStatusOverview status={status} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">DHCP devices</CardTitle>
            <Waypoints aria-hidden="true" className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{devices.length}</p>
            <p className="text-muted-foreground text-xs">Reported in this session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Named devices</CardTitle>
            <Network aria-hidden="true" className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{namedDevices}</p>
            <p className="text-muted-foreground text-xs">Devices with a hostname</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground text-xs">
        Router {status?.system.modelName ?? session?.router.name ?? 'Unavailable'} · Uptime{' '}
        {status?.system.uptimeSeconds === null || status?.system.uptimeSeconds === undefined
          ? 'unavailable'
          : `${Math.floor(status.system.uptimeSeconds / 86_400)} days`}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(240px,1fr)_2fr]">
        <SpeedTestCard />

        <Card>
          <CardHeader>
            <CardTitle>Recent devices</CardTitle>
            <CardDescription>Devices reported by DHCP in the current session.</CardDescription>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No network devices found.</p>
            ) : (
              <div className="divide-y rounded-md border">
                {devices.slice(0, 5).map((device) => (
                  <div className="flex items-center justify-between gap-4 p-3" key={device.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {deviceAliases[device.id] || device.name || 'Unknown device'}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">{device.macAddress}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm">{device.ipAddress || 'No IP address'}</p>
                      {device.interfaceName && (
                        <p className="text-muted-foreground text-xs">{device.interfaceName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to={routes.devices}>View all devices</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
