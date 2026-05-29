/**
 * Defines the MemoryFolderOpenOperation protocol contract for daemon bridge messages.
 * Opens the memory collection's folder in the host OS file browser.
 */
export interface MemoryFolderOpenOperation {
  name: 'openMemoryFolder';
  request: {
    memoryId: string;
  };
  response: {
    path: string;
  };
}
