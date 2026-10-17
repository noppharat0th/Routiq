import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { NetworkDevice } from '../../core/router.types.js';

const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    isArray: (name) => ['Instance', 'ParaName', 'ParaValue'].includes(name),
});

interface ZteInstance {
    ParaName?: string[];
    ParaValue?: string[];
}

export class ZteDhcpInformationMissingError extends Error {
    constructor(responseFields: string[]) {
        const fieldList = responseFields.length > 0 ? responseFields.join(', ') : 'none';
        super(`DHCP information missing (response fields: ${fieldList})`);
        this.name = 'ZteDhcpInformationMissingError';
    }
}

function parseDevice(instance: ZteInstance): NetworkDevice {
    const names = instance.ParaName ?? [];
    const values = instance.ParaValue ?? [];

    if (!Array.isArray(names) || !Array.isArray(values) || names.length !== values.length) {
        throw new Error('Invalid ZTE parameters');
    }

    const fields: Record<string, string> = {};
    names.forEach((name, index) => {
        fields[name] = String(values[index] ?? '');
    });

    if (!fields.IPAddr || !fields.MACAddr) {
        throw new Error('Device missing IP or MAC');
    }

    const lease = Number(fields.ExpiredTime);

    return {
        id: fields.MACAddr.toLowerCase(),
        name: fields.HostName || null,
        ipAddress: fields.IPAddr,
        macAddress: fields.MACAddr.toLowerCase(),
        interfaceName: fields.PhyPortName || null,
        leaseRemainingSeconds:
            fields.ExpiredTime !== undefined && Number.isFinite(lease) && lease >= 0 ? lease : null,
    };
}

export function parseZteDevices(xml: string): NetworkDevice[] {
    if (XMLValidator.validate(xml) !== true) {
        throw new Error('Invalid ZTE XML');
    }

    const document = parser.parse(xml);
    const root = document.ajax_response_xml_root;

    if (!root) {
        throw new Error('Unexpected ZTE response');
    }

    const errorString = root.IF_ERRORSTR;
    if (
        root.IF_ERRORPARAM !== 'SUCC' ||
        root.IF_ERRORTYPE !== 'SUCC' ||
        (errorString !== undefined && errorString !== 'SUCC')
    ) {
        const detail = typeof errorString === 'string' && errorString ? `: ${errorString}` : '';
        throw new Error(`ZTE returned an error${detail}`);
    }

    const dhcpHostInfo = root.OBJ_DHCPHOSTINFO_ID;

    if (dhcpHostInfo === undefined || dhcpHostInfo === null) {
        throw new ZteDhcpInformationMissingError(Object.keys(root));
    }


    if (dhcpHostInfo === '') {
        return [];
    }

    if (typeof dhcpHostInfo !== 'object') {
        throw new Error('Invalid ZTE DHCP information');
    }

    const instances = dhcpHostInfo.Instance ?? [];
    return instances.map(parseDevice);
}
