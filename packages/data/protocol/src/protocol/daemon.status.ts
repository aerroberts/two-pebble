export interface DaemonStatusOperation {
  name: 'getDaemonStatus';
  request: Record<string, never>;
  response: {
    port: number;
    activeAgentIds: string[];
  };
}
