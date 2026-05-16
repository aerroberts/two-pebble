/**
 * Defines the TasksCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TasksCreateOperation {
  name: 'createTask';
  request: {
    boardId: string;
    poolId: string | null;
    name: string;
    description?: string;
    templateId?: string | null;
    dependsOn: string[];
  };
  response: {
    id: string;
  };
}
