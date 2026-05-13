import type {
  Datastore,
  TaskRecord as DatastoreTaskRecord,
  TaskBoardRecord,
  TaskDependencyRecord,
  TaskPoolRecord,
} from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { TaskEventRecord as ProtocolTaskEventRecord, ProtocolTaskRecord } from '@two-pebble/protocol';
import type { SettableTaskStatus } from '@two-pebble/tasks';

export interface TaskBoardServiceContext {
  datastore: Datastore;
  logger: Logger;
}

export interface PoolReplayRow {
  id: string;
  parentPoolId: string | null;
}

export interface CreateBoardInput {
  name: string;
}

export interface CreatePoolInput {
  boardId: string;
  parentPoolId: string | null;
  name: string;
  dependsOn: string[];
}

export interface CreateTaskInput {
  boardId: string;
  poolId: string | null;
  name: string;
  description?: string;
  dependsOn: string[];
}

export interface SetTaskStatusInput {
  id: string;
  status: SettableTaskStatus;
  reason: string;
}

export type EffectiveTaskStatus = 'blocked' | 'open' | 'working' | 'waiting' | 'success' | 'failure';
export type OwnerId = string | null;

export type RecordedTaskEvent = ProtocolTaskEventRecord;

export interface RecordDelegationInput {
  taskId: string;
  agentId: string;
  agentRegistryId: string;
  agentName: string;
  reason: string;
}

export interface RecordUndelegationInput {
  taskId: string;
  agentId: string;
  reason: string;
}

export interface CreateDependencyInput {
  boardId: string;
  fromId: string;
  toId: string;
}

export interface DeleteDependencyInput {
  fromId: string;
  toId: string;
}

export interface BoardSnapshot {
  board: TaskBoardRecord;
  pools: TaskPoolRecord[];
  tasks: ProtocolTaskRecord[];
  dependencies: TaskDependencyRecord[];
}

export type DatastoreTaskRow = DatastoreTaskRecord;

export interface MutationContextInput {
  boardId: string;
  primaryReason?: string;
  primaryTaskId?: string;
  cascadeReason: string;
}

export interface CapturedStatusEvent {
  taskId: string;
  status: EffectiveTaskStatus;
  reason: string;
}

export interface MutationOutcome<T> {
  result: T;
  events: RecordedTaskEvent[];
}

export type TaskMutationOutcome = MutationOutcome<ProtocolTaskRecord>;
export type DependencyMutationOutcome = MutationOutcome<TaskDependencyRecord>;

export interface SyncTasksFromAgentInput {
  agentId: string;
  agentStatus: 'failed';
  reason?: string;
}

export interface SyncTasksFromAgentResult {
  tasks: ProtocolTaskRecord[];
  events: RecordedTaskEvent[];
}
