/**
 * Defines the MemoryFilesListOperation protocol contract for daemon bridge messages.
 * Returns every file in the collection folder with UI-facing metadata.
 */
export interface MemoryFileEntry {
  path: string;
  sizeBytes: number;
  updatedAt: number;
}

export interface MemoryFilesListOperation {
  name: 'listMemoryFiles';
  request: {
    memoryId: string;
  };
  response: {
    entries: MemoryFileEntry[];
    files: string[];
  };
}
