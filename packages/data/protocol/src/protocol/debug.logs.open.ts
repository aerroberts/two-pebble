export interface DebugLogsOpenOperation {
  name: 'openDebugLog';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
