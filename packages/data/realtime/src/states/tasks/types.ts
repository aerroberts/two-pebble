import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export type TaskBoardRecord = RealtimeEmitResponse<'listTaskBoards'>['items'][number];
export type TaskPoolRecord = RealtimeEmitResponse<'listTaskPools'>['items'][number];
export type ProtocolTaskRecord = RealtimeEmitResponse<'listTasks'>['items'][number];
export type TaskDependencyRecord = RealtimeEmitResponse<'listTaskDependencies'>['items'][number];
export type TaskEventRecord = RealtimeEmitResponse<'listTaskEvents'>['items'][number];
export type TaskTemplateRecord = RealtimeEmitResponse<'listTaskTemplates'>['items'][number];
export type TaskTemplateDeliverableRecord = RealtimeEmitResponse<'listTaskTemplateDeliverables'>['items'][number];
export type TaskDeliverableRecord = RealtimeEmitResponse<'listTaskDeliverables'>['items'][number];
export type TaskDeliverableSubmissionRecord = RealtimeEmitResponse<'listTaskDeliverableSubmissions'>['items'][number];
export type TrackedPrRecord = RealtimeEmitResponse<'listTrackedPrs'>['items'][number];

export type CreateTaskBoardInput = RealtimeEmitPayload<'createTaskBoard'>;
export type UpdateTaskBoardInput = RealtimeEmitPayload<'updateTaskBoard'>;
export type DeleteTaskBoardInput = RealtimeEmitPayload<'deleteTaskBoard'>;
export type CreateTaskPoolInput = RealtimeEmitPayload<'createTaskPool'>;
export type DeleteTaskPoolInput = RealtimeEmitPayload<'deleteTaskPool'>;
export type SetTaskPoolTemplateInput = RealtimeEmitPayload<'setTaskPoolTemplate'>;
export type CreateTaskInput = RealtimeEmitPayload<'createTask'>;
export type DelegateTaskInput = RealtimeEmitPayload<'delegateTask'>;
export type RenameTaskInput = RealtimeEmitPayload<'renameTask'>;
export type SetTaskStatusInput = RealtimeEmitPayload<'setTaskStatus'>;
export type UndelegateTaskInput = RealtimeEmitPayload<'undelegateTask'>;
export type UpdateTaskDescriptionInput = RealtimeEmitPayload<'updateTaskDescription'>;
export type DeleteTaskInput = RealtimeEmitPayload<'deleteTask'>;
export type CreateTaskDependencyInput = RealtimeEmitPayload<'createTaskDependency'>;
export type DeleteTaskDependencyInput = RealtimeEmitPayload<'deleteTaskDependency'>;
export type CreateTaskTemplateInput = RealtimeEmitPayload<'createTaskTemplate'>;
export type UpdateTaskTemplateInput = RealtimeEmitPayload<'updateTaskTemplate'>;
export type DeleteTaskTemplateInput = RealtimeEmitPayload<'deleteTaskTemplate'>;
export type CreateTaskTemplateDeliverableInput = RealtimeEmitPayload<'createTaskTemplateDeliverable'>;
export type UpdateTaskTemplateDeliverableInput = RealtimeEmitPayload<'updateTaskTemplateDeliverable'>;
export type DeleteTaskTemplateDeliverableInput = RealtimeEmitPayload<'deleteTaskTemplateDeliverable'>;
export type CreateTaskDeliverableInput = RealtimeEmitPayload<'createTaskDeliverable'>;
export type UpdateTaskDeliverableInput = RealtimeEmitPayload<'updateTaskDeliverable'>;
export type DeleteTaskDeliverableInput = RealtimeEmitPayload<'deleteTaskDeliverable'>;

export interface TasksState {
  taskBoards: LoadableRegistry<TaskBoardRecord>;
  taskPools: LoadableRegistry<TaskPoolRecord>;
  tasks: LoadableRegistry<ProtocolTaskRecord>;
  taskDependencies: LoadableRegistry<TaskDependencyRecord>;
  taskEvents: LoadableRegistry<TaskEventRecord>;
  taskTemplates: LoadableRegistry<TaskTemplateRecord>;
  taskTemplateDeliverables: LoadableRegistry<TaskTemplateDeliverableRecord>;
  taskDeliverables: LoadableRegistry<TaskDeliverableRecord>;
  taskDeliverableSubmissions: LoadableRegistry<TaskDeliverableSubmissionRecord>;
  trackedPrs: LoadableRegistry<TrackedPrRecord>;
}
