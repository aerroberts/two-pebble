/**
 * Defines the MemoryFilesWriteOperation protocol contract for daemon bridge messages.
 * `file` is a path relative to the collection folder; the daemon rejects
 * any path that escapes the folder and creates parent directories as needed.
 */
export interface MemoryFilesWriteOperation {
  name: 'writeMemoryFile';
  request: {
    memoryId: string;
    file: string;
    body: string;
  };
  response: {
    file: string;
  };
}
