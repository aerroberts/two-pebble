/**
 * Defines the TaskPoolsCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskPoolsCreateOperation {
  name: 'createTaskPool';
  request: {
    boardId: string;
    parentPoolId: string | null;
    name: string;
    dependsOn: string[];
  };
  response: {
    id: string;
  };
}
