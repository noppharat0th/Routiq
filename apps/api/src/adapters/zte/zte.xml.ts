import { XMLParser, XMLValidator } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  isArray: (name) => ['Instance', 'ParaName', 'ParaValue'].includes(name),
});

export type ZteFields = Record<string, string>;
export type ZteRoot = Record<string, unknown>;

export function parseZteRoot(xml: string): ZteRoot {
  if (XMLValidator.validate(xml) !== true) {
    throw new Error('Invalid ZTE XML');
  }

  const root = parser.parse(xml).ajax_response_xml_root as ZteRoot | undefined;
  if (!root) {
    throw new Error('Unexpected ZTE response');
  }

  const errorString = root.IF_ERRORSTR;
  if (
    root.IF_ERRORPARAM !== 'SUCC' ||
    root.IF_ERRORTYPE !== 'SUCC' ||
    (errorString !== undefined && errorString !== 'SUCC')
  ) {
    throw new Error(
      typeof errorString === 'string' && errorString
        ? `ZTE returned an error: ${errorString}`
        : 'ZTE returned an error'
    );
  }

  return root;
}

// Convert ZTE name/value arrays into plain objects.
export function readZteInstances(root: ZteRoot, objectName: string): ZteFields[] {
  const object = root[objectName];
  if (!object || typeof object !== 'object') {
    return [];
  }

  const instances = (object as { Instance?: unknown[] }).Instance ?? [];

  return instances.map((instance) => {
    if (!instance || typeof instance !== 'object') {
      return {};
    }

    const names = (instance as { ParaName?: string[] }).ParaName ?? [];
    const values = (instance as { ParaValue?: string[] }).ParaValue ?? [];
    const fields: ZteFields = {};

    names.forEach((name, index) => {
      fields[name] = String(values[index] ?? '');
    });

    return fields;
  });
}

export function firstZteInstance(root: ZteRoot, objectName: string): ZteFields {
  return readZteInstances(root, objectName)[0] ?? {};
}

export function zteNullable(
  value: string | undefined,
  unavailableValues: string[] = []
): string | null {
  if (!value || unavailableValues.includes(value)) {
    return null;
  }

  return value;
}

export function zteNumberOrNull(value: string | undefined): number | null {
  if (value === undefined || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function zteIsEnabled(value: string | undefined): boolean {
  return value === '1' || value?.toLowerCase() === 'true';
}
