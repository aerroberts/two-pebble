/**
 * Defines the WorkspaceRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface WorkspaceRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  path: string;
  worktreeId: string | null;
}

/**
 * Defines the WorkspacesUpdatedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface WorkspacesUpdatedEvent {
  name: 'workspaceUpdated';
  payload: WorkspaceRecord;
}
