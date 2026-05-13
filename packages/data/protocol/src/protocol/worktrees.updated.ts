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

export interface WorktreesUpdatedEvent {
  name: 'worktreeUpdated';
  payload: WorktreeRecord;
}
