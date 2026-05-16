/**
 * Defines the DebugLogsOpenOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DebugLogsOpenOperation {
  name: 'openDebugLog';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
