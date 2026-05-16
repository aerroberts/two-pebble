/**
 * Defines the WorktreeRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface WorktreeRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  repositoryId: string;
  branch: string;
  path: string;
  status: 'creating' | 'active' | 'deleted';
}

/**
 * Defines the WorktreesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
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
