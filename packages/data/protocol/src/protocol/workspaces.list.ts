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
 * Defines the WorkspacesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface WorkspacesListOperation {
  name: 'listWorkspaces';
  request: {
    limit?: number;
    offset?: number;
  };
  response: {
    items: WorkspaceRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
