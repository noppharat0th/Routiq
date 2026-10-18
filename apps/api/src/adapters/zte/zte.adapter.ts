import type {
  NetworkDevice,
  RouterAdapter,
  RouterCapabilities,
  RouterDosSettings,
  RouterFirewallLevel,
  RouterFirewallSettings,
  RouterNetworkInsights,
  RouterStatus,
} from '../../core/router.types.js';
import { ZteSession } from './zte.session.js';
import { ZteClient } from './zte.client.js';
import { ZteAuth } from './zte.auth.js';
import { parseZteDevices } from './zte.parser.js';
import { parseZteRouterStatus } from './zte.status-parser.js';
import { parseZteNetworkInsights } from './zte.insights-parser.js';
import { firstZteInstance, parseZteRoot, zteIsEnabled } from './zte.xml.js';

export class ZteAdapter implements RouterAdapter {
  readonly id = 'zte-f6107a';
  readonly name = 'ZTE F6107A';

  private readonly session = new ZteSession();
  private readonly client: ZteClient;
  private readonly auth: ZteAuth;
  private operationQueue: Promise<void> = Promise.resolve();

  constructor(routerUrl: string) {
    this.client = new ZteClient(routerUrl, this.session);
    this.auth = new ZteAuth(this.client, this.session);
  }

  getCapabilities(): RouterCapabilities {
    return {
      listDevices: true,
      readStatus: true,
      readNetworkInsights: true,
      configureFirewall: true,
      configureDosProtection: true,
      internetBlock: false,
      wifiDisconnect: false,
    };
  }

  async prepareLogin(): Promise<void> {
    await this.auth.prepare();
  }

  async getCaptcha(): Promise<Buffer> {
    return this.auth.getCaptcha();
  }

  async login(username: string, password: string, captcha: string): Promise<boolean> {
    return this.auth.login(username, password, captcha);
  }

  async getDevices(): Promise<NetworkDevice[]> {
    return this.runExclusive(async () => {
      this.requireAuthentication();

      const menuResponse = await this.client.get('menuView', 'lanMgrIpv4', {
        Menu3Location: '0',
      });
      await menuResponse.arrayBuffer();

      return this.fetchDevices();
    });
  }

  private async fetchDevices(): Promise<NetworkDevice[]> {
    const response = await this.client.get('menuData', 'Localnet_LanMgrIpv4_DHCPHostInfo_lua.lua');
    return parseZteDevices(await response.text());
  }

  async getStatus(): Promise<RouterStatus> {
    return this.runExclusive(async () => {
      this.requireAuthentication();

      const homeXml = await this.getContextData('homePage', 'home_ais_lua.lua');
      const opticalXml = await this.getContextData('ponopticalinfo', 'optical_info_lua.lua');
      const systemXml = await this.getContextData('statusMgr', 'devmgr_systemInfo_lua.lua');
      const firewallXml = await this.getContextData('firewall', 'firewall_config_lua.lua');
      const firewallDosXml = await this.getContextData('firewall', 'firewall_dos_lua.lua');

      return parseZteRouterStatus({
        homeXml,
        opticalXml,
        systemXml,
        firewallXml,
        firewallDosXml,
      });
    });
  }

  async getNetworkInsights(): Promise<RouterNetworkInsights> {
    return this.runExclusive(async () => {
      this.requireAuthentication();

      const wanXml = await this.getContextData('ethWanStatus', 'wan_internetstatus_lua.lua', {
        TypeUplink: '2',
        pageType: '1',
      });
      const lanXml = await this.getContextData('localNetStatus', 'status_lan_info_lua.lua');
      const wifiClientsXml = await this.getContextData(
        'localNetStatus',
        'wlan_client_stat_lua.lua'
      );
      const upnpXml = await this.getContextData('upnp', 'upnp_portmap_lua.lua');
      const ipv4RoutesXml = await this.getContextData('routeIpv4', 'route_routetableipv4_lua.lua');
      const ipv6RoutesXml = await this.getContextData('routeIpv6', 'route_routetableipv6_lua.lua');
      const loggingXml = await this.getContextData('logMgr', 'ais_log_syslogmgr_lua.lua');

      return parseZteNetworkInsights({
        wanXml,
        lanXml,
        wifiClientsXml,
        upnpXml,
        ipv4RoutesXml,
        ipv6RoutesXml,
        loggingXml,
      });
    });
  }

  async setFirewallLevel(level: RouterFirewallLevel): Promise<RouterFirewallSettings> {
    return this.runExclusive(async () => {
      this.requireAuthentication();

      const currentXml = await this.getContextData('firewall', 'firewall_config_lua.lua');
      const current = firstZteInstance(parseZteRoot(currentXml), 'OBJ_FWLEVEL_ID');
      const instanceId = current._InstID;
      const sessionToken = this.session.getSessionToken();

      if (!instanceId || !sessionToken) {
        throw new Error('Firewall configuration context is unavailable');
      }

      if (current.Level !== level) {
        const response = await this.client.post('menuData', 'firewall_config_lua.lua', {
          IF_ACTION: 'Apply',
          _InstID: instanceId,
          Level: level,
          _sessionTOKEN: sessionToken,
        });
        parseZteRoot(await response.text());
      }

      const verifiedResponse = await this.client.get('menuData', 'firewall_config_lua.lua');
      const verified = firstZteInstance(
        parseZteRoot(await verifiedResponse.text()),
        'OBJ_FWLEVEL_ID'
      );

      if (verified.Level !== level) {
        throw new Error('Router did not retain the requested firewall level');
      }

      return {
        enabled: zteIsEnabled(verified.Enable),
        level,
      };
    });
  }

  async setDosProtection(settings: RouterDosSettings): Promise<RouterDosSettings> {
    return this.runExclusive(async () => {
      this.requireAuthentication();

      const currentXml = await this.getContextData('firewall', 'firewall_dos_lua.lua');
      const current = firstZteInstance(parseZteRoot(currentXml), 'OBJ_FWDOS_ID');
      const instanceId = current._InstID;
      const sessionToken = this.session.getSessionToken();

      if (!instanceId || !sessionToken) {
        throw new Error('DoS protection configuration context is unavailable');
      }

      const currentThreshold = Number(current.Threshold);
      const changed =
        zteIsEnabled(current.Enable) !== settings.enabled ||
        currentThreshold !== settings.threshold;

      if (changed) {
        const response = await this.client.post('menuData', 'firewall_dos_lua.lua', {
          IF_ACTION: 'Apply',
          _InstID: instanceId,
          Enable: settings.enabled ? '1' : '0',
          Threshold: String(settings.threshold),
          _sessionTOKEN: sessionToken,
        });
        parseZteRoot(await response.text());
      }

      const verifiedResponse = await this.client.get('menuData', 'firewall_dos_lua.lua');
      const verified = firstZteInstance(
        parseZteRoot(await verifiedResponse.text()),
        'OBJ_FWDOS_ID'
      );
      const verifiedSettings = {
        enabled: zteIsEnabled(verified.Enable),
        threshold: Number(verified.Threshold),
      };

      if (
        verifiedSettings.enabled !== settings.enabled ||
        verifiedSettings.threshold !== settings.threshold
      ) {
        throw new Error('Router did not retain the requested DoS protection settings');
      }

      return verifiedSettings;
    });
  }

  private requireAuthentication(): void {
    if (!this.auth.isAuthenticated()) {
      throw new Error('Router is not authenticated');
    }
  }

  private async getContextData(
    viewTag: string,
    dataTag: string,
    params?: Record<string, string>
  ): Promise<string> {
    // Open the router page before requesting its data.
    const menuResponse = await this.client.get('menuView', viewTag);
    await menuResponse.arrayBuffer();

    const dataResponse = await this.client.get('menuData', dataTag, params);
    return dataResponse.text();
  }

  // Run router operations one at a time.
  private runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.operationQueue.then(operation, operation);
    this.operationQueue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }

  async clearSession(): Promise<void> {
    await this.session.clear();
  }
}
