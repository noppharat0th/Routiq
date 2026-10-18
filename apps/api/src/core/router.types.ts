export interface NetworkDevice {
  id: string;
  name: string | null;
  ipAddress: string | null;
  macAddress: string;
  interfaceName: string | null;
  leaseRemainingSeconds: number | null;
}

export interface RouterCapabilities {
  listDevices: boolean;
  readStatus: boolean;
  readNetworkInsights: boolean;
  configureFirewall: boolean;
  configureDosProtection: boolean;
  internetBlock: boolean;
  wifiDisconnect: boolean;
}

export type RouterFirewallLevel = 'Low' | 'Middle' | 'High';

export interface RouterFirewallSettings {
  enabled: boolean;
  level: RouterFirewallLevel;
}

export interface RouterDosSettings {
  enabled: boolean;
  threshold: number;
}

export interface RouterWifiNetwork {
  id: string;
  name: string | null;
  enabled: boolean;
}

export interface RouterStatus {
  collectedAt: string;
  system: {
    modelName: string | null;
    softwareVersion: string | null;
    hardwareVersion: string | null;
    uptimeSeconds: number | null;
    cpuUsagePercent: number | null;
    memoryUsagePercent: number | null;
    flashUsagePercent: number | null;
    totalFlashBytes: number | null;
  };
  internet: {
    connected: boolean;
    ipv4Address: string | null;
    ipv6Address: string | null;
    dns: string | null;
    downloadRate: string | null;
    uploadRate: string | null;
  };
  optical: {
    registered: boolean;
    registrationCode: number | null;
    lossOfSignal: boolean;
    receivePowerDbm: number | null;
    transmitPowerDbm: number | null;
    temperatureCelsius: number | null;
    voltageMillivolts: number | null;
    currentMilliamps: number | null;
    onlineSeconds: number | null;
  };
  security: {
    firewallEnabled: boolean;
    firewallLevel: string | null;
    dosProtectionEnabled: boolean;
    dosThreshold: number | null;
  };
  wifiNetworks: RouterWifiNetwork[];
}

export interface RouterLanPort {
  id: string;
  name: string;
  connected: boolean;
  speedMbps: number | null;
  duplex: string | null;
  receivedBytes: number | null;
  sentBytes: number | null;
  receivedPackets: number | null;
  sentPackets: number | null;
  receivedErrors: number | null;
  sentErrors: number | null;
  receivedDiscards: number | null;
  sentDiscards: number | null;
}

export interface RouterWifiClient {
  id: string;
  networkId: string | null;
  hostname: string | null;
  macAddress: string | null;
  ipv4Address: string | null;
  ipv6Address: string | null;
  signalDbm: number | null;
  noiseDbm: number | null;
  signalToNoiseDb: number | null;
  receivedRateKbps: number | null;
  sentRateKbps: number | null;
  receivedBytes: number | null;
  sentBytes: number | null;
  linkTimeSeconds: number | null;
  mode: string | null;
  bandwidth: string | null;
}

export interface RouterUpnpMapping {
  id: string;
  protocol: string | null;
  externalPort: number | null;
  internalPort: number | null;
  internalClient: string | null;
  description: string | null;
}

export interface RouterRoute {
  id: string;
  addressFamily: 'IPv4' | 'IPv6';
  destination: string | null;
  prefix: string | null;
  gateway: string | null;
  interfaceName: string | null;
}

export interface RouterNetworkInsights {
  collectedAt: string;
  wan: {
    name: string | null;
    connectionType: string | null;
    ipv4Status: string | null;
    ipv6Status: string | null;
    uptimeSeconds: number | null;
    ipv6UptimeSeconds: number | null;
    ipv4Address: string | null;
    subnetMask: string | null;
    gateway: string | null;
    dnsServers: string[];
    ipv6Address: string | null;
    ipv6PrefixLength: number | null;
    ipv6Gateway: string | null;
    receivedBytes: number | null;
    sentBytes: number | null;
    receivedPackets: number | null;
    sentPackets: number | null;
    receivedErrors: number | null;
    sentErrors: number | null;
    mtu: number | null;
    vlanId: number | null;
    natEnabled: boolean;
  };
  lanPorts: RouterLanPort[];
  wifiClients: RouterWifiClient[];
  upnpMappings: RouterUpnpMapping[];
  routes: RouterRoute[];
  logging: {
    enabled: boolean;
    localLevel: number | null;
    remoteEnabled: boolean;
    remoteAddress: string | null;
    remotePort: number | null;
  };
}

export interface RouterAdapter {
  readonly id: string;
  readonly name: string;

  getCapabilities(): RouterCapabilities;
  getDevices(): Promise<NetworkDevice[]>;
  getStatus(): Promise<RouterStatus>;
  getNetworkInsights(): Promise<RouterNetworkInsights>;
  setFirewallLevel(level: RouterFirewallLevel): Promise<RouterFirewallSettings>;
  setDosProtection(settings: RouterDosSettings): Promise<RouterDosSettings>;
}
