export type SettableTaskStatus = 'working' | 'waiting' | 'success' | 'failure';
export type TaskStatus = 'pending' | SettableTaskStatus;

export interface TaskBoardPoolNode {
  id: string;
  name: string;
  parentPoolId: string | null;
}

export interface TaskBoardTaskNode {
  id: string;
  name: string;
  description: string;
  poolId: string | null;
  status: TaskStatus;
  effectiveStatus: TaskStatus | 'blocked' | 'open';
  ownerId: string | null;
}

export interface TaskBoardDependencyEdge {
  fromId: string;
  toId: string;
}

export interface TaskBoardSnapshot {
  boardId: string;
  boardName: string;
  pools: TaskBoardPoolNode[];
  tasks: TaskBoardTaskNode[];
  dependencies: TaskBoardDependencyEdge[];
}

export interface TaskBoardCreateTaskInput {
  boardId: string;
  name: string;
  description?: string;
  poolId?: string | null;
  dependsOn?: string[];
}

export interface TaskBoardRenameTaskInput {
  taskId: string;
  name: string;
}

export interface TaskBoardUpdateTaskDescriptionInput {
  boardId?: string;
  taskId: string;
  description: string;
}

export interface TaskBoardSetTaskStatusInput {
  boardId: string;
  taskId: string;
  status: SettableTaskStatus;
  reason: string;
}

export interface TaskBoardDeleteTaskInput {
  boardId: string;
  taskId: string;
}

export interface TaskBoardCreatePoolInput {
  boardId: string;
  name: string;
  parentPoolId?: string | null;
  dependsOn?: string[];
}

export interface TaskBoardDeletePoolInput {
  boardId: string;
  poolId: string;
}

export interface TaskBoardDependencyInput {
  boardId: string;
  fromTaskId: string;
  toTaskId: string;
}

export interface TaskBoardEventRecord {
  id: string;
  kind: 'status' | 'delegated' | 'undelegated';
  taskId: string;
  reason: string;
  createdAt: number;
  status?: TaskStatus | 'blocked' | 'open';
  agentId?: string;
  agentName?: string;
}

export interface TaskBoardRunner {
  describeBoard(boardId: string): Promise<TaskBoardSnapshot>;
  createTask(input: TaskBoardCreateTaskInput): Promise<{ id: string }>;
  renameTask(input: TaskBoardRenameTaskInput): Promise<void>;
  updateTaskDescription(input: TaskBoardUpdateTaskDescriptionInput): Promise<void>;
  setTaskStatus(input: TaskBoardSetTaskStatusInput): Promise<void>;
  deleteTask(input: TaskBoardDeleteTaskInput): Promise<void>;
  createPool(input: TaskBoardCreatePoolInput): Promise<{ id: string }>;
  deletePool(input: TaskBoardDeletePoolInput): Promise<void>;
  addDependency(input: TaskBoardDependencyInput): Promise<void>;
  deleteDependency(input: TaskBoardDependencyInput): Promise<void>;
  listTaskEvents(boardId: string, taskId: string): Promise<TaskBoardEventRecord[]>;
}
