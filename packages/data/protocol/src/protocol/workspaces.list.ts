export interface WorkspaceRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  path: string;
  worktreeId: string | null;
}

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
