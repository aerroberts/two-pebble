/**
 * Emitted when an agent is delegated to a task on a board.
 * The agent's trace view renders this as a "Assigned to <task>" entry
 * with the task description as plaintext body and a click-through to the
 * task in the board UI.
 */
export interface PebbleAgentTaskAssignedTrace {
  type: 'task-assigned';
  data: {
    taskId: string;
    taskName: string;
    taskDescription: string;
    boardId: string;
  };
}
