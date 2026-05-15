export interface HeartbeatReport {
  listenerId: string;
  kind: 'automation' | 'task-board';
  outcome: 'fired' | 'skipped' | 'error';
  detail: Record<string, unknown>;
}

export interface HeartbeatRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  tickAt: number;
  durationMs: number;
  listenerCount: number;
  reports: HeartbeatReport[];
}

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
