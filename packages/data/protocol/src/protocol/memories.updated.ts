import type { MemoryRecord } from './memories.create';

/**
 * Defines the MemoryUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MemoryUpdatedEvent {
  name: 'memoryUpdated';
  payload: MemoryRecord;
}
