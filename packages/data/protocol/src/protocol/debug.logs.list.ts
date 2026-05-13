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
