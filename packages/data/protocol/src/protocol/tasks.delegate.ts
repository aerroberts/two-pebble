/**
 * Defines the TasksDelegateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TasksDelegateOperation {
  name: 'delegateTask';
  request: {
    taskId: string;
    agentRegistryId: string;
  };
  response: {
    agentId: string;
  };
}
