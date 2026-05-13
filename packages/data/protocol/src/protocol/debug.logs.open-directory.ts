export interface DebugLogsOpenDirectoryOperation {
  name: 'openDebugLogsDirectory';
  request: Record<string, never>;
  response: {
    path: string;
  };
}
