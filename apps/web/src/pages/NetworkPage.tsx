import {
  Activity,
  Cable,
  FileClock,
  Globe2,
  LoaderCircle,
  RefreshCw,
  Route,
  Share2,
  Wifi,
} from 'lucide-react';
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
import { useRouterController } from '@/controllers/use-router-controller';

function formatBytes(value: number | null): string {
  if (value === null) return 'Unavailable';
  if (value === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** unitIndex;
  return `${amount.toFixed(amount >= 100 ? 0 : amount >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function formatRate(kbps: number | null): string {
  if (kbps === null) return 'Unavailable';
  return kbps >= 1000 ? `${(kbps / 1000).toFixed(1)} Mbps` : `${kbps} Kbps`;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return 'Unavailable';
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`;
}

function Detail({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 break-all text-sm font-medium">{value ?? 'Unavailable'}</p>
    </div>
  );
}

export function NetworkPage() {
  const { networkInsights, pendingAction, refreshDevices } = useRouterController();
  const refreshing = pendingAction !== null;
  const wan = networkInsights?.wan;
  const ipv4Routes =
    networkInsights?.routes.filter((route) => route.addressFamily === 'IPv4') ?? [];
  const ipv6Routes =
    networkInsights?.routes.filter((route) => route.addressFamily === 'IPv6') ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Network Insights</h1>
          <p className="text-muted-foreground text-sm">
            Live read-only information reported by the router.
          </p>
        </div>
        <Button
          disabled={refreshing}
          onClick={() => void refreshDevices()}
          type="button"
          variant="outline"
        >
          {refreshing ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <RefreshCw aria-hidden="true" />
          )}
          Refresh
        </Button>
      </div>

      <div className="bg-muted/50 flex gap-3 rounded-md border p-4 text-sm">
        <Activity aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          This page only reads status data. It cannot restart, disconnect, or reconfigure the
          router.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>WAN connection</CardTitle>
              <CardDescription>{wan?.name ?? 'Primary internet connection'}</CardDescription>
            </div>
            <Globe2 aria-hidden="true" className="text-muted-foreground size-5" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Detail label="IPv4 status" value={wan?.ipv4Status ?? null} />
            <Detail label="IPv6 status" value={wan?.ipv6Status ?? null} />
            <Detail label="Type" value={wan?.connectionType ?? null} />
            <Detail label="Uptime" value={formatDuration(wan?.uptimeSeconds ?? null)} />
            <Detail label="IPv4 address" value={wan?.ipv4Address ?? null} />
            <Detail label="Gateway" value={wan?.gateway ?? null} />
            <Detail label="MTU" value={wan?.mtu ?? null} />
            <Detail label="VLAN" value={wan?.vlanId ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>WAN traffic</CardTitle>
              <CardDescription>Counters since the connection started.</CardDescription>
            </div>
            <Activity aria-hidden="true" className="text-muted-foreground size-5" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Detail label="Received" value={formatBytes(wan?.receivedBytes ?? null)} />
            <Detail label="Sent" value={formatBytes(wan?.sentBytes ?? null)} />
            <Detail label="RX packets" value={wan?.receivedPackets?.toLocaleString() ?? null} />
            <Detail label="TX packets" value={wan?.sentPackets?.toLocaleString() ?? null} />
            <Detail label="RX errors" value={wan?.receivedErrors ?? null} />
            <Detail label="TX errors" value={wan?.sentErrors ?? null} />
            <Detail label="NAT" value={wan ? (wan.natEnabled ? 'Enabled' : 'Disabled') : null} />
            <Detail label="DNS" value={wan?.dnsServers.join(', ') || null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>System logging</CardTitle>
              <CardDescription>Current logging configuration.</CardDescription>
            </div>
            <FileClock aria-hidden="true" className="text-muted-foreground size-5" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Local logging</span>
              <Badge variant={networkInsights?.logging.enabled ? 'default' : 'secondary'}>
                {networkInsights
                  ? networkInsights.logging.enabled
                    ? 'Enabled'
                    : 'Disabled'
                  : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Remote logging</span>
              <Badge variant={networkInsights?.logging.remoteEnabled ? 'default' : 'secondary'}>
                {networkInsights
                  ? networkInsights.logging.remoteEnabled
                    ? 'Enabled'
                    : 'Disabled'
                  : 'Unavailable'}
              </Badge>
            </div>
            <Detail
              label="Remote destination"
              value={networkInsights?.logging.remoteAddress ?? null}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cable aria-hidden="true" className="size-5" />
            <CardTitle>LAN ports</CardTitle>
          </div>
          <CardDescription>
            Link speed, traffic, and error counters for each Ethernet port.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Port</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {networkInsights?.lanPorts.map((port) => (
                <TableRow key={port.id}>
                  <TableCell className="font-medium">{port.name}</TableCell>
                  <TableCell>
                    <Badge variant={port.connected ? 'default' : 'secondary'}>
                      {port.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {port.connected ? `${port.speedMbps ?? '—'} Mbps · ${port.duplex ?? '—'}` : '—'}
                  </TableCell>
                  <TableCell>{formatBytes(port.receivedBytes)}</TableCell>
                  <TableCell>{formatBytes(port.sentBytes)}</TableCell>
                  <TableCell>{(port.receivedErrors ?? 0) + (port.sentErrors ?? 0)}</TableCell>
                </TableRow>
              ))}
              {!networkInsights?.lanPorts.length && (
                <TableRow>
                  <TableCell className="text-muted-foreground h-24 text-center" colSpan={6}>
                    No LAN port information.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wifi aria-hidden="true" className="size-5" />
            <CardTitle>Connected Wi-Fi clients</CardTitle>
            <Badge variant="secondary">{networkInsights?.wifiClients.length ?? 0}</Badge>
          </div>
          <CardDescription>
            Signal quality and negotiated link rates reported by the access point.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Receive rate</TableHead>
                <TableHead>Send rate</TableHead>
                <TableHead>Connected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {networkInsights?.wifiClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <p className="font-medium">{client.hostname || 'Unknown device'}</p>
                    <p className="text-muted-foreground text-xs">
                      {client.ipv4Address || client.macAddress || 'No address'}
                    </p>
                  </TableCell>
                  <TableCell>{client.networkId ?? '—'}</TableCell>
                  <TableCell>
                    {client.signalDbm === null ? '—' : `${client.signalDbm} dBm`}
                    <p className="text-muted-foreground text-xs">
                      SNR {client.signalToNoiseDb ?? '—'} dB
                    </p>
                  </TableCell>
                  <TableCell>
                    {client.mode ?? '—'}
                    <p className="text-muted-foreground text-xs">{client.bandwidth ?? '—'}</p>
                  </TableCell>
                  <TableCell>{formatRate(client.receivedRateKbps)}</TableCell>
                  <TableCell>{formatRate(client.sentRateKbps)}</TableCell>
                  <TableCell>{formatDuration(client.linkTimeSeconds)}</TableCell>
                </TableRow>
              ))}
              {!networkInsights?.wifiClients.length && (
                <TableRow>
                  <TableCell className="text-muted-foreground h-24 text-center" colSpan={7}>
                    No connected Wi-Fi clients.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Share2 aria-hidden="true" className="size-5" />
              <CardTitle>UPnP mappings</CardTitle>
              <Badge variant="secondary">{networkInsights?.upnpMappings.length ?? 0}</Badge>
            </div>
            <CardDescription>Ports currently opened dynamically by local devices.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocol</TableHead>
                  <TableHead>External</TableHead>
                  <TableHead>Internal target</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkInsights?.upnpMappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>{mapping.protocol ?? '—'}</TableCell>
                    <TableCell>{mapping.externalPort ?? '—'}</TableCell>
                    <TableCell>
                      {mapping.internalClient ?? '—'}:{mapping.internalPort ?? '—'}
                    </TableCell>
                    <TableCell className="max-w-52 truncate">
                      {mapping.description ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {!networkInsights?.upnpMappings.length && (
                  <TableRow>
                    <TableCell className="text-muted-foreground h-24 text-center" colSpan={4}>
                      No active UPnP mappings.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Route aria-hidden="true" className="size-5" />
              <CardTitle>Routing table</CardTitle>
              <Badge variant="secondary">
                {ipv4Routes.length} IPv4 · {ipv6Routes.length} IPv6
              </Badge>
            </div>
            <CardDescription>Active routes selected by the router.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Family</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Interface</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkInsights?.routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <Badge variant="outline">{route.addressFamily}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {route.destination ?? '—'}
                      {route.prefix ?? ''}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{route.gateway ?? 'Direct'}</TableCell>
                    <TableCell>{route.interfaceName ?? '—'}</TableCell>
                  </TableRow>
                ))}
                {!networkInsights?.routes.length && (
                  <TableRow>
                    <TableCell className="text-muted-foreground h-24 text-center" colSpan={4}>
                      No route information.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
