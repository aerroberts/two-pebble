import type { MemoryRecord } from './memories.create';

/**
 * Defines the ReadMemoryOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ReadMemoryOperation {
  name: 'readMemory';
  request: {
    id: string;
  };
  response: MemoryRecord;
}
