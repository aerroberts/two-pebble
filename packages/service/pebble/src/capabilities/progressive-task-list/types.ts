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
