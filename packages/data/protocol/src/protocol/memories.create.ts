/**
 * Defines the MemoryRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface MemoryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  description: string;
  name: string;
  projectId: string;
  /**
   * Absolute path to the on-disk folder backing this collection. Callers may
   * supply it at creation; otherwise the daemon creates a default path.
   */
  path: string;
}

/**
 * Defines the CreateMemoryOperation protocol contract for daemon bridge messages.
 * The daemon pre-generates the id, resolves the folder path, writes the row,
 * then creates the folder and seeds `index.md` if needed.
 */
export interface CreateMemoryOperation {
  name: 'createMemory';
  request: {
    description?: string;
    name: string;
    path?: string;
    projectId?: string;
  };
  response: MemoryRecord;
}
