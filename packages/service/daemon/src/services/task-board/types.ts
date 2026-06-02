import type {
  TaskRecord as DatastoreTaskRecord,
  TaskBoardRecord,
  TaskDeliverablePayload,
  TaskDeliverableRecord,
  TaskDeliverableSubmissionRecord,
  TaskDependencyRecord,
  TaskPoolRecord,
} from '@two-pebble/datastore';
import type { TaskEventRecord as ProtocolTaskEventRecord, ProtocolTaskRecord } from '@two-pebble/protocol';
import type { SettableTaskStatus } from '@two-pebble/tasks';

export interface PoolReplayRow {
  id: string;
  parentPoolId: string | null;
}

export interface CreateBoardInput {
  name: string;
  projectId: string;
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
  descriptionContent?: string | null;
  dependsOn: string[];
  templateId?: string | null;
}

export interface SetTaskStatusInput {
  id: string;
  status: SettableTaskStatus;
  reason: string;
}

export interface SubmitDeliverableInput {
  taskId: string;
  deliverableId: string;
  payload: TaskDeliverablePayload;
}

export type EffectiveTaskStatus = 'blocked' | 'open' | 'working' | 'waiting' | 'success' | 'failure' | 'canceled';

export type RecordedTaskEvent = ProtocolTaskEventRecord;

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

export type { TaskDeliverablePayload, TaskDeliverableRecord, TaskDeliverableSubmissionRecord };
