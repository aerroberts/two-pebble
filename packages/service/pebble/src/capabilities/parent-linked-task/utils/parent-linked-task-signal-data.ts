import type { PebbleJsonRecord, PebbleJsonValue } from '../../../types';

export function objectData(value: PebbleJsonValue): PebbleJsonRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value;
}

export function stringField(data: PebbleJsonRecord, key: string): string | undefined {
  const value = data[key];
  return typeof value === 'string' ? value : undefined;
}
