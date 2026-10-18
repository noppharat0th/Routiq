import type {
  RouterLanPort,
  RouterNetworkInsights,
  RouterRoute,
  RouterUpnpMapping,
  RouterWifiClient,
} from '../../core/router.types.js';
import {
  firstZteInstance,
  parseZteRoot,
  readZteInstances,
  zteIsEnabled,
  zteNullable,
  zteNumberOrNull,
  type ZteFields,
} from './zte.xml.js';

export interface ZteNetworkInsightDocuments {
  wanXml: string;
  lanXml: string;
  wifiClientsXml: string;
  upnpXml: string;
  ipv4RoutesXml: string;
  ipv6RoutesXml: string;
  loggingXml: string;
}

function parseLanPort(fields: ZteFields, index: number): RouterLanPort {
  const id = fields._InstID || `lan-${index + 1}`;
  const portNumber = id.match(/IF(\d+)$/)?.[1] ?? String(index + 1);

  return {
    id,
    name: `LAN ${portNumber}`,
    connected: fields.Status === '0',
    speedMbps: zteNumberOrNull(fields.Speed),
    duplex: zteNullable(fields.Duplex),
    receivedBytes: zteNumberOrNull(fields.InBytes),
    sentBytes: zteNumberOrNull(fields.OutBytes),
    receivedPackets: zteNumberOrNull(fields.InPkts),
    sentPackets: zteNumberOrNull(fields.OutPkts),
    receivedErrors: zteNumberOrNull(fields.InError),
    sentErrors: zteNumberOrNull(fields.OutError),
    receivedDiscards: zteNumberOrNull(fields.InDiscard),
    sentDiscards: zteNumberOrNull(fields.OutDiscard),
  };
}

function parseWifiClient(fields: ZteFields, index: number): RouterWifiClient {
  return {
    id: fields._InstID || fields.MACAddress || `wifi-client-${index + 1}`,
    networkId: zteNullable(fields.AliasName),
    hostname: zteNullable(fields.HostName),
    macAddress: zteNullable(fields.MACAddress)?.toLowerCase() ?? null,
    ipv4Address: zteNullable(fields.IPAddress, ['0.0.0.0']),
    ipv6Address: zteNullable(fields.IPV6Address, ['::']),
    signalDbm: zteNumberOrNull(fields.RSSI),
    noiseDbm: zteNumberOrNull(fields.NOISE),
    signalToNoiseDb: zteNumberOrNull(fields.SNR),
    receivedRateKbps: zteNumberOrNull(fields.RxRate),
    sentRateKbps: zteNumberOrNull(fields.TxRate),
    receivedBytes: zteNumberOrNull(fields.RXBytes),
    sentBytes: zteNumberOrNull(fields.TXBytes),
    linkTimeSeconds: zteNumberOrNull(fields.LinkTime),
    mode: zteNullable(fields.CurrentMode),
    bandwidth: zteNullable(fields.BAND),
  };
}

function parseUpnpMapping(fields: ZteFields, index: number): RouterUpnpMapping {
  return {
    id: fields._InstID || `upnp-${index + 1}`,
    protocol: zteNullable(fields.Protocol),
    externalPort: zteNumberOrNull(fields.ExternalPort),
    internalPort: zteNumberOrNull(fields.InternalPort),
    internalClient: zteNullable(fields.InternalClient),
    description: zteNullable(fields.Description),
  };
}

function parseIpv4Route(fields: ZteFields, index: number): RouterRoute {
  return {
    id: `ipv4-${index}-${fields.DestIP || 'unknown'}`,
    addressFamily: 'IPv4',
    destination: zteNullable(fields.DestIP),
    prefix: zteNullable(fields.DestIPMask),
    gateway: zteNullable(fields.GWIP, ['0.0.0.0']),
    interfaceName: zteNullable(fields.Interface),
  };
}

function parseIpv6Route(fields: ZteFields, index: number): RouterRoute {
  const destination = zteNullable(fields.DestIP);
  const prefixLength = zteNullable(fields.PrefixLen);

  return {
    id: `ipv6-${index}-${destination || 'unknown'}`,
    addressFamily: 'IPv6',
    destination,
    prefix: prefixLength ? `/${prefixLength}` : null,
    gateway: zteNullable(fields.GWIP, ['::']),
    interfaceName: zteNullable(fields.Interface),
  };
}

export function parseZteNetworkInsights(
  documents: ZteNetworkInsightDocuments
): RouterNetworkInsights {
  const wanRoot = parseZteRoot(documents.wanXml);
  const lanRoot = parseZteRoot(documents.lanXml);
  const wifiClientsRoot = parseZteRoot(documents.wifiClientsXml);
  const upnpRoot = parseZteRoot(documents.upnpXml);
  const ipv4RoutesRoot = parseZteRoot(documents.ipv4RoutesXml);
  const ipv6RoutesRoot = parseZteRoot(documents.ipv6RoutesXml);
  const loggingRoot = parseZteRoot(documents.loggingXml);
  const wan = firstZteInstance(wanRoot, 'ID_WAN_COMFIG');
  const logging = firstZteInstance(loggingRoot, 'OBJ_LOG_AIS_ID');

  return {
    collectedAt: new Date().toISOString(),
    wan: {
      name: zteNullable(wan.WANCName),
      connectionType: zteNullable(wan.TransType || wan.wantype),
      ipv4Status: zteNullable(wan.ConnStatus),
      ipv6Status: zteNullable(wan.ConnStatus6),
      uptimeSeconds: zteNumberOrNull(wan.UpTime),
      ipv6UptimeSeconds: zteNumberOrNull(wan.UpTimeV6),
      ipv4Address: zteNullable(wan.IPAddress, ['0.0.0.0']),
      subnetMask: zteNullable(wan.SubnetMask, ['0.0.0.0']),
      gateway: zteNullable(wan.GateWay, ['0.0.0.0']),
      dnsServers: [wan.DNS1, wan.DNS2, wan.DNS3].filter((value): value is string =>
        Boolean(value && value !== '0.0.0.0')
      ),
      ipv6Address: zteNullable(wan.Gua1, ['::']),
      ipv6PrefixLength: zteNumberOrNull(wan.Gua1PrefixLen),
      ipv6Gateway: zteNullable(wan.Gateway6, ['::']),
      receivedBytes: zteNumberOrNull(wan.RxBytes),
      sentBytes: zteNumberOrNull(wan.TxBytes),
      receivedPackets: zteNumberOrNull(wan.RxPackets),
      sentPackets: zteNumberOrNull(wan.TxPackets),
      receivedErrors: zteNumberOrNull(wan.ErrorsReceived),
      sentErrors: zteNumberOrNull(wan.ErrorsSent),
      mtu: zteNumberOrNull(wan.MTU),
      vlanId: zteNumberOrNull(wan.VLANID),
      natEnabled: zteIsEnabled(wan.IsNAT),
    },
    lanPorts: readZteInstances(lanRoot, 'OBJ_PON_PORT_BASIC_STATUS_ID').map(parseLanPort),
    wifiClients: readZteInstances(wifiClientsRoot, 'OBJ_WLAN_AD_ID').map(parseWifiClient),
    upnpMappings: readZteInstances(upnpRoot, 'OBJ_UPNPPORTMAP_ID').map(parseUpnpMapping),
    routes: [
      ...readZteInstances(ipv4RoutesRoot, 'OBJ_ROUTETABLE_ID').map(parseIpv4Route),
      ...readZteInstances(ipv6RoutesRoot, 'OBJ_ROUTETABLE6_ID').map(parseIpv6Route),
    ],
    logging: {
      enabled: zteIsEnabled(logging.LogEnable),
      localLevel: zteNumberOrNull(logging.AisLogLevelNum),
      remoteEnabled: zteIsEnabled(logging.ServiceEnable),
      remoteAddress: zteNullable(logging.ServiceIp),
      remotePort: zteNumberOrNull(logging.ServicePort),
    },
  };
}
