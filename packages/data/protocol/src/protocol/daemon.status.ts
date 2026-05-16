/**
 * Defines the DaemonStatusOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DaemonStatusOperation {
  name: 'getDaemonStatus';
  request: Record<string, never>;
  response: {
    port: number;
    activeAgentIds: string[];
  };
}
