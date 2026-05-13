export interface DebugLogsReadOperation {
  name: 'readDebugLog';
  request: {
    id: string;
  };
  response: {
    content: string;
    id: string;
    name: string;
    path: string;
    sizeBytes: number;
    updatedAtIso: string;
  };
}
