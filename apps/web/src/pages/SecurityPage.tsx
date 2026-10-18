import { useEffect, useState } from 'react';
import { CircleAlert, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { DeviceAliasEditor } from '@/components/devices/DeviceAliasEditor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouterController } from '@/controllers/use-router-controller';
import type { RouterFirewallLevel } from '@/models/router.model';
import { useDeviceTrustStore } from '@/stores/device-trust.store';
import { useRouterStore } from '@/stores/router.store';

const firewallLevelDescription: Record<RouterFirewallLevel, string> = {
  Low: 'Allows WAN hosts to reach LAN hosts more freely. This reduces protection.',
  Middle: 'The router vendor recommendation and the safest general-purpose setting.',
  High: 'Restricts LAN-to-WAN traffic to selected ports and may interrupt apps or services.',
};

function isFirewallLevel(value: string | null | undefined): value is RouterFirewallLevel {
  return value === 'Low' || value === 'Middle' || value === 'High';
}

export function SecurityPage() {
  const devices = useRouterStore((state) => state.devices);
  const session = useRouterStore((state) => state.session);
  const status = useRouterStore((state) => state.status);
  const { pendingAction, updateDosProtection, updateFirewallLevel } = useRouterController();
  const [selectedFirewallLevel, setSelectedFirewallLevel] = useState<RouterFirewallLevel>('Middle');
  const [selectedDosEnabled, setSelectedDosEnabled] = useState(true);
  const [selectedDosThreshold, setSelectedDosThreshold] = useState('100');
  const trustedDeviceIds = useDeviceTrustStore((state) => state.trustedDeviceIds);
  const deviceAliases = useDeviceTrustStore((state) => state.deviceAliases);
  const setTrusted = useDeviceTrustStore((state) => state.setTrusted);
  const setAlias = useDeviceTrustStore((state) => state.setAlias);
  const trustedIds = new Set(trustedDeviceIds);
  const trustedCount = devices.filter((device) => trustedIds.has(device.id)).length;
  const unknownCount = devices.length - trustedCount;
  const canBlockDevices = session?.router.capabilities.internetBlock ?? false;
  const canConfigureFirewall = session?.router.capabilities.configureFirewall ?? false;
  const canConfigureDos = session?.router.capabilities.configureDosProtection ?? false;
  const currentFirewallLevel = isFirewallLevel(status?.security.firewallLevel)
    ? status.security.firewallLevel
    : null;
  const updatingFirewall = pendingAction === 'firewall';
  const updatingDos = pendingAction === 'dos';
  const dosThreshold = Number(selectedDosThreshold);
  const dosThresholdIsValid =
    Number.isInteger(dosThreshold) && dosThreshold >= 1 && dosThreshold <= 65_535;
  const dosSettingsChanged =
    status !== null &&
    (status.security.dosProtectionEnabled !== selectedDosEnabled ||
      status.security.dosThreshold !== dosThreshold);

  useEffect(() => {
    if (currentFirewallLevel) setSelectedFirewallLevel(currentFirewallLevel);
  }, [currentFirewallLevel]);

  useEffect(() => {
    if (!status) return;
    setSelectedDosEnabled(status.security.dosProtectionEnabled);
    if (status.security.dosThreshold !== null) {
      setSelectedDosThreshold(String(status.security.dosThreshold));
    }
  }, [status]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
        <p className="text-muted-foreground text-sm">
          Review devices and keep a local inventory of equipment you recognize.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Router firewall</CardTitle>
            <Shield aria-hidden="true" className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Badge variant={status?.security.firewallEnabled ? 'default' : 'secondary'}>
                {status
                  ? status.security.firewallEnabled
                    ? 'Enabled'
                    : 'Disabled'
                  : 'Unavailable'}
              </Badge>
              <p className="text-muted-foreground text-xs">
                Level: {status?.security.firewallLevel ?? 'Unavailable'}
              </p>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Protection level</p>
                <Select
                  disabled={!canConfigureFirewall || updatingFirewall}
                  onValueChange={(value: string) => {
                    if (isFirewallLevel(value)) setSelectedFirewallLevel(value);
                  }}
                  value={selectedFirewallLevel}
                >
                  <SelectTrigger className="w-full" aria-label="Firewall level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Middle">Middle (recommended)</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-muted-foreground text-xs">
                {firewallLevelDescription[selectedFirewallLevel]}
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={
                      !canConfigureFirewall ||
                      updatingFirewall ||
                      currentFirewallLevel === selectedFirewallLevel
                    }
                    type="button"
                  >
                    {updatingFirewall ? 'Applying...' : 'Apply firewall level'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Change firewall level to {selectedFirewallLevel}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {firewallLevelDescription[selectedFirewallLevel]} The router will apply this
                      immediately. Routiq will then read the value back to verify it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => void updateFirewallLevel(selectedFirewallLevel)}
                    >
                      Confirm and apply
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">DoS protection</CardTitle>
            <ShieldAlert aria-hidden="true" className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Badge variant={status?.security.dosProtectionEnabled ? 'default' : 'secondary'}>
                {status
                  ? status.security.dosProtectionEnabled
                    ? 'Enabled'
                    : 'Disabled'
                  : 'Unavailable'}
              </Badge>
              <p className="text-muted-foreground text-xs">
                Threshold: {status?.security.dosThreshold ?? 'Unavailable'}
              </p>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Protection</p>
                  <Select
                    disabled={!canConfigureDos || updatingDos}
                    onValueChange={(value: string) => setSelectedDosEnabled(value === 'enabled')}
                    value={selectedDosEnabled ? 'enabled' : 'disabled'}
                  >
                    <SelectTrigger className="w-full" aria-label="DoS protection status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Threshold</p>
                  <Input
                    aria-invalid={!dosThresholdIsValid}
                    disabled={!canConfigureDos || updatingDos}
                    max={65_535}
                    min={1}
                    onChange={(event) => setSelectedDosThreshold(event.target.value)}
                    type="number"
                    value={selectedDosThreshold}
                  />
                </div>
              </div>

              <p className="text-muted-foreground text-xs">
                Allowed range: 1–65535. A value that is too low may block normal connections.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={
                      !canConfigureDos || updatingDos || !dosThresholdIsValid || !dosSettingsChanged
                    }
                    type="button"
                  >
                    {updatingDos ? 'Applying...' : 'Apply DoS settings'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apply DoS protection settings?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Protection will be {selectedDosEnabled ? 'enabled' : 'disabled'} with a
                      threshold of {dosThreshold}. Low thresholds may reject normal traffic. Routiq
                      will read the values back after applying them.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        void updateDosProtection({
                          enabled: selectedDosEnabled,
                          threshold: dosThreshold,
                        })
                      }
                    >
                      Confirm and apply
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Trusted devices</CardTitle>
            <ShieldCheck aria-hidden="true" className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{trustedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Needs review</CardTitle>
            <ShieldQuestion aria-hidden="true" className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{unknownCount}</p>
          </CardContent>
        </Card>
      </div>

      {!canBlockDevices && (
        <div className="bg-muted/50 flex gap-3 rounded-md border p-4 text-sm">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            The ZTE adapter currently supports device discovery only. Trust labels organize your
            local inventory; they do not block or disconnect devices from the router.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Device trust inventory</CardTitle>
          <CardDescription>Trust is stored locally by MAC address in this browser.</CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <p className="text-muted-foreground text-sm">No DHCP devices are available.</p>
          ) : (
            <div className="divide-y rounded-md border">
              {devices.map((device) => {
                const trusted = trustedIds.has(device.id);
                const alias = deviceAliases[device.id] ?? '';
                const displayName = alias || device.name || 'Unknown device';

                return (
                  <div
                    className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                    key={device.id}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{displayName}</p>
                        <Badge variant={trusted ? 'default' : 'secondary'}>
                          {trusted ? 'Trusted' : 'Review'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {device.ipAddress || 'No IP'} · {device.macAddress}
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                      <DeviceAliasEditor
                        alias={alias}
                        deviceName={displayName}
                        onSave={(nextAlias) => setAlias(device.id, nextAlias)}
                      />
                      <Button
                        onClick={() => setTrusted(device.id, !trusted)}
                        size="sm"
                        type="button"
                        variant={trusted ? 'outline' : 'default'}
                      >
                        {trusted ? 'Remove trust' : 'Mark trusted'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
