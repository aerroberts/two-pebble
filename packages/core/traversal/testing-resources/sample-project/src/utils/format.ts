import { inspect } from 'node:util';

export const formatVersion = '1';

export function formatLabel(value: string) {
  return value.trim().toLowerCase();
}

export const formatDebug = (value: unknown) => inspect(value);
