import { LoadableRegistry } from '../../loadable';
import type {
  ProtocolTaskRecord,
  TaskBoardRecord,
  TaskDependencyRecord,
  TaskEventRecord,
  TaskPoolRecord,
  TasksState,
} from './types';

export function createTasksState(): TasksState {
  return {
    taskBoards: new LoadableRegistry<TaskBoardRecord>(),
    taskPools: new LoadableRegistry<TaskPoolRecord>(),
    tasks: new LoadableRegistry<ProtocolTaskRecord>(),
    taskDependencies: new LoadableRegistry<TaskDependencyRecord>(),
    taskEvents: new LoadableRegistry<TaskEventRecord>(),
  };
}
