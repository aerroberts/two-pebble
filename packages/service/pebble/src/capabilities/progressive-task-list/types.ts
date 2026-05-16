export type TaskStatus = 'pending' | 'open' | 'completed' | 'invalid';

export interface TaskInput {
  id: string;
  description: string;
  dependsOn?: string;
  hiddenUntilActive?: boolean;
  autocompleteTurns?: number;
}

export type Task = TaskInput & {
  status: TaskStatus;
  openedOnTurn: number;
  autoCompleted?: boolean;
  completionReason?: string;
  invalidReason?: string;
};

export interface ProgressiveTaskListCapabilityParams {
  tasks?: TaskInput[];
  /**
   * When set, the capability binds to this document: every turn re-reads
   * the document body, syncs the in-memory tasks slot from the embedded
   * `todoItem` nodes, and mirrors `mark-task-complete` /
   * `mark-task-invalid` tool calls back into the document JSON. The
   * binding is durable across daemon restarts and immutable for the
   * lifetime of the agent.
   */
  documentId?: string;
}

export interface ProgressiveTaskListStatus {
  allTasksTerminal: boolean;
  openTasks: Task[];
  visibleTasks: Task[];
  statusPrompt: string;
  completedTasks: Task[];
  invalidTasks: Task[];
}

export type TaskUpdater = (task: Task) => Task;

export type TerminalTaskStatus = 'completed' | 'invalid';
export type TaskCompletionType = 'manual' | 'automatic';

export interface MirrorStatusInput {
  taskId: string;
  status: TerminalTaskStatus;
  completionType?: TaskCompletionType;
}
