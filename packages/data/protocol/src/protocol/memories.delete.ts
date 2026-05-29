/**
 * Defines the DeleteMemoryOperation protocol contract for daemon bridge messages.
 * Removes the row only; the on-disk folder is always kept.
 */
export interface DeleteMemoryOperation {
  name: 'deleteMemory';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
