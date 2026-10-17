import type { RouterAdapter, RouterCapabilities, NetworkDevice } from '../../core/router.types.js';
import { ZteSession } from './zte.session.js';
import { ZteClient } from './zte.client.js';
import { ZteAuth } from './zte.auth.js';
import { parseZteDevices } from './zte.parser.js';

export class ZteAdapter implements RouterAdapter {
    readonly id = 'zte-f6107a';
    readonly name = 'ZTE F6107A';

    private readonly session = new ZteSession();
    private readonly client: ZteClient;
    private readonly auth: ZteAuth;

    constructor(routerUrl: string) {
        this.client = new ZteClient(routerUrl, this.session);
        this.auth = new ZteAuth(this.client, this.session);
    }

    getCapabilities(): RouterCapabilities {
        return {
            listDevices: true,
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
        if (!this.auth.isAuthenticated()) {
            throw new Error('Router is not authenticated');
        }

        const menuResponse = await this.client.get('menuView', 'lanMgrIpv4', {
            Menu3Location: '0',
        });
        await menuResponse.arrayBuffer();

        return this.fetchDevices();
    }

    private async fetchDevices(): Promise<NetworkDevice[]> {
        const response = await this.client.get('menuData', 'Localnet_LanMgrIpv4_DHCPHostInfo_lua.lua');
        return parseZteDevices(await response.text());
    }

    async clearSession(): Promise<void> {
        await this.session.clear();
    }
}
