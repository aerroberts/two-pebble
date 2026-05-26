import os from 'node:os';
import path from 'node:path';

const homeRootDirectoryPath = path.resolve(os.homedir(), '.two-pebble');

export const defaultHost = process.env.TWO_PEBBLE_HOST ?? '127.0.0.1';

/**
 * Hardcoded daemon port. Two Pebble assumes one daemon instance per
 * host so neither the daemon nor the CLI tries to probe alternative
 * ports.
 */
export const DAEMON_PORT = 49152;

export const defaultLogDirectoryPath = path.resolve(homeRootDirectoryPath, 'logs');
export const defaultDataDirectoryPath = path.resolve(homeRootDirectoryPath, 'data');

/**
 * Canonical daemon database file path.
 */
export function defaultDatabaseFilePath() {
  return path.join(defaultDataDirectoryPath, `two-pebble-${DAEMON_PORT}.db`);
}

export function createDaemonLogFilePath() {
  return path.join(defaultLogDirectoryPath, `${crypto.randomUUID()}.log`);
}
