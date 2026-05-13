import type { TaskStatusIconStatus } from '../task-status-icon/types';

export interface TaskGraphInputTask {
  id: string;
  name: string;
  poolId: string | null;
  status: TaskStatusIconStatus;
}

export interface TaskGraphInputPool {
  id: string;
  name: string;
  parentPoolId: string | null;
}

export interface TaskGraphInputDependency {
  fromId: string;
  toId: string;
}

export interface TaskGraphInput {
  tasks: TaskGraphInputTask[];
  pools: TaskGraphInputPool[];
  dependencies: TaskGraphInputDependency[];
}

export interface TaskGraphTaskNodeData {
  name: string;
  status: TaskStatusIconStatus;
}

export interface TaskGraphPoolNodeData {
  name: string;
}

export type TaskGraphNodeKind = 'task' | 'pool';

export interface TaskGraphLevelLayout {
  width: number;
  height: number;
  positions: Map<string, TaskGraphPosition>;
}

export interface TaskGraphPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}
