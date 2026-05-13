export type TaskListUpdateStatus = 'pending' | 'open' | 'completed' | 'invalid';

export interface TaskListUpdateTask {
  id: string;
  status: TaskListUpdateStatus;
  description: string;
  statusReason?: string;
  completionType?: 'manual' | 'automatic';
}

export interface TaskListUpdateChange {
  id: string;
  oldStatus: TaskListUpdateStatus | null;
  newStatus: TaskListUpdateStatus;
}

export interface PebbleAgentTaskListUpdateTrace {
  type: 'task-list-update';
  data: {
    tasks: TaskListUpdateTask[];
    changes: TaskListUpdateChange[];
  };
}
