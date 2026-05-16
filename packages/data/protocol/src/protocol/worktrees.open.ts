/**
 * Defines the WorktreesOpenOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface WorktreesOpenOperation {
  name: 'openWorktree';
  request: {
    id: string;
  };
  response: {
    path: string;
  };
}
