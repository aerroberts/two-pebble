/**
 * Defines the MemoryFilesReadOperation protocol contract for daemon bridge messages.
 * `file` is a path relative to the collection folder; the daemon rejects
 * any path that escapes the folder.
 */
export interface MemoryFilesReadOperation {
  name: 'readMemoryFile';
  request: {
    memoryId: string;
    file: string;
  };
  response: {
    content: string;
  };
}
