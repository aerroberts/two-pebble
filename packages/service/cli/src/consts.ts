/**
 * Default daemon port for the happy path of `peb run`.
 * The daemon mirrors this value in its own consts; keep them in sync.
 * Multiple instances probe upward from this port.
 */
export const DEFAULT_DAEMON_PORT = 49152;

/**
 * Builds the canonical daemon WebSocket URL for a port on localhost.
 * Used by every CLI command that connects to a running daemon.
 */
export function daemonUrlForPort(port: number) {
  return `ws://127.0.0.1:${port}`;
}
