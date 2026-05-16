type WorktreeStatus = 'creating' | 'active' | 'deleted';

interface WorktreeRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  repositoryId: string;
  branch: string;
  path: string;
  status: WorktreeStatus;
}

/**
 * Defines the WorktreesUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface WorktreesUpdatedEvent {
  name: 'worktreeUpdated';
  payload: WorktreeRecord;
}
