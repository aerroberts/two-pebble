/**
 * Defines the DebugLogUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DebugLogUpdatedEvent {
  name: 'debugLogUpdated';
  payload: {
    id: string;
    name: string;
    path: string;
    sizeBytes: number;
    updatedAtIso: string;
  };
}
