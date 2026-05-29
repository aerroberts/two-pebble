import type { MemoryRecord } from './memories.create';

/**
 * Defines the MemoriesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MemoriesListOperation {
  name: 'listMemories';
  request: {
    limit?: number;
    offset?: number;
    projectId?: string;
  };
  response: {
    items: MemoryRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
