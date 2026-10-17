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
    internetBlock: boolean;
    wifiDisconnect: boolean;
}

export interface RouterAdapter {
    readonly id: string;
    readonly name: string;

    getCapabilities(): RouterCapabilities;
    getDevices(): Promise<NetworkDevice[]>;
}
