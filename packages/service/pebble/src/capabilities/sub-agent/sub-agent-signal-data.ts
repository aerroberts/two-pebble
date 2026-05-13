import type { PebbleJsonRecord, PebbleJsonValue } from '../../types';

export function objectData(data: PebbleJsonValue): PebbleJsonRecord {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }
  return data;
}

export function stringField(data: PebbleJsonRecord, key: string): string | undefined {
  const value = data[key];
  return typeof value === 'string' ? value : undefined;
}
