import type { RouterStatus, RouterWifiNetwork } from '../../core/router.types.js';
import {
  firstZteInstance,
  parseZteRoot,
  readZteInstances,
  zteIsEnabled,
  zteNullable,
  zteNumberOrNull,
  type ZteRoot,
} from './zte.xml.js';

export interface ZteStatusDocuments {
  homeXml: string;
  opticalXml: string;
  systemXml: string;
  firewallXml: string;
  firewallDosXml: string;
}

function parseWifiNetworks(homeRoot: ZteRoot): RouterWifiNetwork[] {
  return readZteInstances(homeRoot, 'OBJ_WLANAP_ID').map((network) => ({
    id: network._InstID || network.ESSID || 'unknown',
    name: zteNullable(network.ESSID),
    enabled: zteIsEnabled(network.Enable),
  }));
}

export function parseZteRouterStatus(documents: ZteStatusDocuments): RouterStatus {
  const homeRoot = parseZteRoot(documents.homeXml);
  const opticalRoot = parseZteRoot(documents.opticalXml);
  const systemRoot = parseZteRoot(documents.systemXml);
  const firewallRoot = parseZteRoot(documents.firewallXml);
  const firewallDosRoot = parseZteRoot(documents.firewallDosXml);

  const device = firstZteInstance(homeRoot, 'OBJ_DEVINFO_ID');
  const internet = firstZteInstance(homeRoot, 'OBJ_INTERNET_STATUS_ID');
  const rates = firstZteInstance(homeRoot, 'OBJ_HOME_PONRATE_ID');
  const resources = firstZteInstance(systemRoot, 'OBJ_CPUMEMUSAGE_ID');
  const flash = firstZteInstance(systemRoot, 'OBJ_FLASHINFO_ID');
  const uptime = firstZteInstance(systemRoot, 'OBJ_POWERONTIME_ID');
  const optical = firstZteInstance(opticalRoot, 'OBJ_PON_OPTICALPARA_ID');
  const opticalUptime = firstZteInstance(opticalRoot, 'OBJ_PON_POWERONTIME_ID');
  const registration = firstZteInstance(opticalRoot, 'OBJ_GPONREGSTATUS_ID');
  const signal = firstZteInstance(opticalRoot, 'OBJ_LOS_INFO_ID');
  const firewall = firstZteInstance(firewallRoot, 'OBJ_FWLEVEL_ID');
  const firewallDos = firstZteInstance(firewallDosRoot, 'OBJ_FWDOS_ID');
  const ipv4Address = zteNullable(internet.IPAddress, ['0.0.0.0']);
  const ipv6Address = zteNullable(internet.GUAv6, ['::']);
  const registrationCode = zteNumberOrNull(registration.RegStatus);

  return {
    collectedAt: new Date().toISOString(),
    system: {
      modelName: zteNullable(device.ModelName),
      softwareVersion: zteNullable(device.SoftwareVer),
      hardwareVersion: zteNullable(device.HardwareVer),
      uptimeSeconds: zteNumberOrNull(uptime.PowerOnTime),
      cpuUsagePercent: zteNumberOrNull(resources.CpuUsage1),
      memoryUsagePercent: zteNumberOrNull(resources.MemUsage),
      flashUsagePercent: zteNumberOrNull(flash.Flash_Percent_Used),
      totalFlashBytes: zteNumberOrNull(flash.TotalFlash),
    },
    internet: {
      connected: ipv4Address !== null || ipv6Address !== null,
      ipv4Address,
      ipv6Address,
      dns: zteNullable(internet.DNS, ['0.0.0.0']),
      downloadRate: zteNullable(rates.RxRate),
      uploadRate: zteNullable(rates.TxRate),
    },
    optical: {
      registered: registrationCode === 5,
      registrationCode,
      lossOfSignal: signal.LosInfo !== undefined && signal.LosInfo !== '0',
      receivePowerDbm: zteNumberOrNull(optical.RxPower),
      transmitPowerDbm: zteNumberOrNull(optical.TxPower),
      temperatureCelsius: zteNumberOrNull(optical.Temp),
      voltageMillivolts: zteNumberOrNull(optical.Volt),
      currentMilliamps: zteNumberOrNull(optical.Current),
      onlineSeconds: zteNumberOrNull(opticalUptime.PONOnTime),
    },
    security: {
      firewallEnabled: zteIsEnabled(firewall.Enable),
      firewallLevel: zteNullable(firewall.Level),
      dosProtectionEnabled: zteIsEnabled(firewallDos.Enable),
      dosThreshold: zteNumberOrNull(firewallDos.Threshold),
    },
    wifiNetworks: parseWifiNetworks(homeRoot),
  };
}
