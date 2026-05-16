import crypto from 'node:crypto';

const idAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

function createNanoIdLikeValue() {
  const randomBytes = crypto.randomBytes(12);

  return Array.from(randomBytes, (byte) => {
    return idAlphabet[byte % idAlphabet.length];
  }).join('');
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function createTableId(tableName: string) {
  return `${tableName}:${createNanoIdLikeValue()}`;
}
