import { Network, Router, Waypoints } from 'lucide-react';
import { Link } from 'react-router';
import { SpeedTestCard } from '@/components/SpeedTestCard';
import { Badge } from '@/components/ui/badge';
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
import { useRouterStore } from '@/stores/router.store';

export function DashboardPage() {
  const devices = useRouterStore((state) => state.devices);
  const session = useRouterStore((state) => state.session);
  const namedDevices = devices.filter((device) => device.name).length;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Current router session and network overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Router status</CardTitle>
            <Router aria-hidden="true" className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <Badge>Connected</Badge>
            <p className="text-muted-foreground mt-2 text-xs">
              Session {session?.sessionId.slice(0, 8) ?? 'Unavailable'}
            </p>
          </CardContent>
        </Card>

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
                        {device.name || 'Unknown device'}
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
