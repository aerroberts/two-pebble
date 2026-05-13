export interface WorktreesOpenOperation {
  name: 'openWorktree';
  request: {
    id: string;
  };
  response: {
    path: string;
  };
}
