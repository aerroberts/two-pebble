import { createHash } from 'node:crypto';

/**
 * Returns a deterministic JSON string for `value` with object keys sorted
 * lexicographically at every depth. Arrays keep their order. The same logical
 * record on two instances therefore serializes to identical bytes, so a record
 * never shows as `changed` purely because of key ordering.
 */
export function canonicalJSON(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      sorted[key] = sortKeysDeep(source[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Content hash for a record's synced fields. Computed after the field
 * whitelist and FK-name rewrite so identical content on two instances hashes
 * the same regardless of local ids or key ordering.
 */
export function contentHashOf(fields: Record<string, unknown>): string {
  return createHash('sha256').update(canonicalJSON(fields)).digest('hex');
}
