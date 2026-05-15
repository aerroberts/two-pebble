import { LoadableRegistry } from '../../loadable';
import type {
  ProtocolTaskRecord,
  TaskBoardRecord,
  TaskDeliverableRecord,
  TaskDeliverableSubmissionRecord,
  TaskDependencyRecord,
  TaskEventRecord,
  TaskPoolRecord,
  TasksState,
  TaskTemplateDeliverableRecord,
  TaskTemplateRecord,
} from './types';

export function createTasksState(): TasksState {
  return {
    taskBoards: new LoadableRegistry<TaskBoardRecord>(),
    taskPools: new LoadableRegistry<TaskPoolRecord>(),
    tasks: new LoadableRegistry<ProtocolTaskRecord>(),
    taskDependencies: new LoadableRegistry<TaskDependencyRecord>(),
    taskEvents: new LoadableRegistry<TaskEventRecord>(),
    taskTemplates: new LoadableRegistry<TaskTemplateRecord>(),
    taskTemplateDeliverables: new LoadableRegistry<TaskTemplateDeliverableRecord>(),
    taskDeliverables: new LoadableRegistry<TaskDeliverableRecord>(),
    taskDeliverableSubmissions: new LoadableRegistry<TaskDeliverableSubmissionRecord>(),
  };
}
