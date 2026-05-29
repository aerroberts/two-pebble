/**
 * Defines the MemoryRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MemoryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  projectId: string;
  /**
   * Absolute path to the on-disk folder backing this collection, computed
   * as `buildMemoryPath(id)` and stored at creation.
   */
  path: string;
}

/**
 * Defines the CreateMemoryOperation protocol contract for daemon bridge messages.
 * The daemon pre-generates the id, computes the path, writes the row, then
 * creates the folder and seeds `index.md` — all in one round trip.
 */
export interface CreateMemoryOperation {
  name: 'createMemory';
  request: {
    name: string;
    projectId?: string;
  };
  response: MemoryRecord;
}
