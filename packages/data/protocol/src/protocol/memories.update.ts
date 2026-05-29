import type { MemoryRecord } from './memories.create';

/**
 * Defines the UpdateMemoryOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface UpdateMemoryOperation {
  name: 'updateMemory';
  request: {
    id: string;
    description?: string;
    name?: string;
    path?: string;
  };
  response: MemoryRecord;
}
