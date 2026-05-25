/**
 * Hardcoded daemon port. Two Pebble runs a single daemon instance on
 * this port; both the daemon and every CLI command bind to it without
 * probing.
 */
export const DAEMON_PORT = 49152;

/**
 * Canonical daemon WebSocket URL. Used by every CLI command that
 * connects to a running daemon.
 */
export const DAEMON_URL = `ws://127.0.0.1:${DAEMON_PORT}`;
