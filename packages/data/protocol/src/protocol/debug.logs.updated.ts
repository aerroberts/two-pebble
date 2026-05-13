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
