import type { DatastoreOperationBinder } from '../datastore-operation-binder';
import { taskBoardsCreateOperation } from '../operations/task-boards.create';
import { taskBoardsDeleteOperation } from '../operations/task-boards.delete';
import { taskBoardsListOperation } from '../operations/task-boards.list';
import { taskBoardsReadOperation } from '../operations/task-boards.read';
import { taskBoardsUpdateOperation } from '../operations/task-boards.update';
import { taskDependenciesCreateOperation } from '../operations/task-dependencies.create';
import { taskDependenciesDeleteOperation } from '../operations/task-dependencies.delete';
import { taskDependenciesListOperation } from '../operations/task-dependencies.list';
import { taskEventsListOperation } from '../operations/task-events.list';
import { taskEventsRecordOperation } from '../operations/task-events.record';
import { taskPoolsCreateOperation } from '../operations/task-pools.create';
import { taskPoolsDeleteOperation } from '../operations/task-pools.delete';
import { taskPoolsListOperation } from '../operations/task-pools.list';
import { taskPoolsSetParentOperation } from '../operations/task-pools.set-parent';
import { tasksCreateOperation } from '../operations/tasks.create';
import { tasksDeleteOperation } from '../operations/tasks.delete';
import { tasksListOperation } from '../operations/tasks.list';
import { tasksRenameOperation } from '../operations/tasks.rename';
import { tasksSetOwnerOperation } from '../operations/tasks.set-owner';
import { tasksSetPoolOperation } from '../operations/tasks.set-pool';
import { tasksUpdateOperation } from '../operations/tasks.update';
import { tasksUpdateDescriptionOperation } from '../operations/tasks.update-description';

/**
 * Binds task-board persistence handlers.
 *
 * Each board owns pools, tasks, dependencies, and task events.
 */
export function bindTaskBoardOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(taskBoardsCreateOperation, 'task-boards.create'),
    delete: bind(taskBoardsDeleteOperation, 'task-boards.delete'),
    list: bind(taskBoardsListOperation, 'task-boards.list'),
    read: bind(taskBoardsReadOperation, 'task-boards.read'),
    update: bind(taskBoardsUpdateOperation, 'task-boards.update'),
    pools: {
      create: bind(taskPoolsCreateOperation, 'task-pools.create'),
      delete: bind(taskPoolsDeleteOperation, 'task-pools.delete'),
      list: bind(taskPoolsListOperation, 'task-pools.list'),
      setParent: bind(taskPoolsSetParentOperation, 'task-pools.set-parent'),
    },
    tasks: {
      create: bind(tasksCreateOperation, 'tasks.create'),
      delete: bind(tasksDeleteOperation, 'tasks.delete'),
      list: bind(tasksListOperation, 'tasks.list'),
      rename: bind(tasksRenameOperation, 'tasks.rename'),
      setOwner: bind(tasksSetOwnerOperation, 'tasks.set-owner'),
      setPool: bind(tasksSetPoolOperation, 'tasks.set-pool'),
      update: bind(tasksUpdateOperation, 'tasks.update'),
      updateDescription: bind(tasksUpdateDescriptionOperation, 'tasks.update-description'),
    },
    dependencies: {
      create: bind(taskDependenciesCreateOperation, 'task-dependencies.create'),
      delete: bind(taskDependenciesDeleteOperation, 'task-dependencies.delete'),
      list: bind(taskDependenciesListOperation, 'task-dependencies.list'),
    },
    events: {
      list: bind(taskEventsListOperation, 'task-events.list'),
      record: bind(taskEventsRecordOperation, 'task-events.record'),
    },
  };
}
