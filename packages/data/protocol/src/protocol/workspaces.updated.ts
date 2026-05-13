export interface WorkspaceRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  path: string;
  worktreeId: string | null;
}

export interface WorkspacesUpdatedEvent {
  name: 'workspaceUpdated';
  payload: WorkspaceRecord;
}
