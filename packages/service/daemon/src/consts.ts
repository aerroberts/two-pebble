import os from 'node:os';
import path from 'node:path';

const homeRootDirectoryPath = path.resolve(os.homedir(), '.two-pebble');

export const defaultHost = process.env.TWO_PEBBLE_HOST ?? '127.0.0.1';
export const defaultPort = Number(process.env.TWO_PEBBLE_PORT ?? '49152');
export const defaultLogDirectoryPath = path.resolve(homeRootDirectoryPath, 'logs');
export const defaultDataDirectoryPath = path.resolve(homeRootDirectoryPath, 'data');

/**
 * Builds the database file path for a given daemon port.
 * Each port owns its own database file so multiple daemon instances can
 * coexist without colliding on the SQLite write lock.
 */
export function databaseFilePathForPort(port: number) {
  return path.join(defaultDataDirectoryPath, `two-pebble-${port}.db`);
}

export function createDaemonLogFilePath() {
  return path.join(defaultLogDirectoryPath, `${crypto.randomUUID()}.log`);
}
