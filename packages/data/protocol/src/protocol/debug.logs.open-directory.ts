/**
 * Defines the DebugLogsOpenDirectoryOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DebugLogsOpenDirectoryOperation {
  name: 'openDebugLogsDirectory';
  request: Record<string, never>;
  response: {
    path: string;
  };
}
