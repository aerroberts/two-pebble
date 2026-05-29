/**
 * Defines the MemoryDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MemoryDeletedEvent {
  name: 'memoryDeleted';
  payload: {
    id: string;
  };
}
