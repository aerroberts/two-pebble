import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export type TaskBoardRecord = RealtimeEmitResponse<'listTaskBoards'>['items'][number];
export type TaskPoolRecord = RealtimeEmitResponse<'listTaskPools'>['items'][number];
export type ProtocolTaskRecord = RealtimeEmitResponse<'listTasks'>['items'][number];
export type TaskDependencyRecord = RealtimeEmitResponse<'listTaskDependencies'>['items'][number];
export type TaskEventRecord = RealtimeEmitResponse<'listTaskEvents'>['items'][number];

export type CreateTaskBoardInput = RealtimeEmitPayload<'createTaskBoard'>;
export type UpdateTaskBoardInput = RealtimeEmitPayload<'updateTaskBoard'>;
export type DeleteTaskBoardInput = RealtimeEmitPayload<'deleteTaskBoard'>;
export type CreateTaskPoolInput = RealtimeEmitPayload<'createTaskPool'>;
export type DeleteTaskPoolInput = RealtimeEmitPayload<'deleteTaskPool'>;
export type CreateTaskInput = RealtimeEmitPayload<'createTask'>;
export type DelegateTaskInput = RealtimeEmitPayload<'delegateTask'>;
export type RenameTaskInput = RealtimeEmitPayload<'renameTask'>;
export type SetTaskStatusInput = RealtimeEmitPayload<'setTaskStatus'>;
export type UndelegateTaskInput = RealtimeEmitPayload<'undelegateTask'>;
export type UpdateTaskDescriptionInput = RealtimeEmitPayload<'updateTaskDescription'>;
export type DeleteTaskInput = RealtimeEmitPayload<'deleteTask'>;
export type CreateTaskDependencyInput = RealtimeEmitPayload<'createTaskDependency'>;
export type DeleteTaskDependencyInput = RealtimeEmitPayload<'deleteTaskDependency'>;

export interface TasksState {
  taskBoards: LoadableRegistry<TaskBoardRecord>;
  taskPools: LoadableRegistry<TaskPoolRecord>;
  tasks: LoadableRegistry<ProtocolTaskRecord>;
  taskDependencies: LoadableRegistry<TaskDependencyRecord>;
  taskEvents: LoadableRegistry<TaskEventRecord>;
}
