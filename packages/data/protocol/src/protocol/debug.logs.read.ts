/**
 * Defines the DebugLogsReadOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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
