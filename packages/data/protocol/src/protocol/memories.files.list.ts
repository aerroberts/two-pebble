/**
 * Defines the MemoryFilesListOperation protocol contract for daemon bridge messages.
 * Returns the relative paths of every file in the collection folder.
 */
export interface MemoryFilesListOperation {
  name: 'listMemoryFiles';
  request: {
    memoryId: string;
  };
  response: {
    files: string[];
  };
}
