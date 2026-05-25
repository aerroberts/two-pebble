/**
 * Defines the HeartbeatReport protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface HeartbeatReport {
  listenerId: string;
  kind: string;
  outcome: 'fired' | 'skipped' | 'error';
  detail: Record<string, unknown>;
}

/**
 * Defines the HeartbeatRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface HeartbeatRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  tickAt: number;
  durationMs: number;
  listenerCount: number;
  reports: HeartbeatReport[];
}

/**
 * Defines the HeartbeatsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface HeartbeatsListOperation {
  name: 'listHeartbeats';
  request: {
    limit: number;
    offset: number;
  };
  response: {
    items: HeartbeatRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
