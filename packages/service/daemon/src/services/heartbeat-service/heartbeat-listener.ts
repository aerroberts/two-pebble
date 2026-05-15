export interface HeartbeatListener {
  readonly id: string;
  readonly kind: 'automation' | 'task-board';
  onHeartbeat(now: number): Promise<HeartbeatReportDetail>;
}

export interface HeartbeatReportDetail {
  outcome: 'fired' | 'skipped' | 'error';
  detail?: Record<string, unknown>;
}
