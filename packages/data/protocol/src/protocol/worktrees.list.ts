export interface WorktreeRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  repositoryId: string;
  branch: string;
  path: string;
  status: 'creating' | 'active' | 'deleted';
}

export interface WorktreesListOperation {
  name: 'listWorktrees';
  request: {
    limit?: number;
    offset?: number;
    repositoryId?: string;
    status?: 'creating' | 'active' | 'deleted';
  };
  response: {
    items: WorktreeRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
