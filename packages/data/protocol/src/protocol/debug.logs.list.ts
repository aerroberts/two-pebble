/**
 * Defines the DebugLogsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DebugLogsListOperation {
  name: 'listDebugLogs';
  request: {
    limit?: number;
    offset?: number;
  };
  response: {
    items: {
      id: string;
      name: string;
      path: string;
      sizeBytes: number;
      updatedAtIso: string;
    }[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
