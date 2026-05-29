'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import type {
  CreateTaskBoardInput,
  CreateTaskDeliverableInput,
  CreateTaskDependencyInput,
  CreateTaskInput,
  CreateTaskPoolInput,
  DelegateTaskInput,
  DeleteTaskBoardInput,
  DeleteTaskDependencyInput,
  DeleteTaskInput,
  DeleteTaskPoolInput,
  RenameTaskInput,
  SetTaskPoolTemplateInput,
  SetTaskStatusInput,
  UndelegateTaskInput,
  UpdateTaskBoardInput,
  UpdateTaskDescriptionInput,
} from '../types';

/**
 * Returns bound mutation helpers for the tasks feature.
 * Each helper proxies the underlying realtime operation and returns its
 * promise, leaving error display to the caller.
 */
export function useTaskBoardMutations() {
  const datastore = useRealtimeDatastore();
  return {
    createBoard: (input: CreateTaskBoardInput) => datastore.taskBoards.create(input),
    updateBoard: (input: UpdateTaskBoardInput) => datastore.taskBoards.update(input),
    deleteBoard: (input: DeleteTaskBoardInput) => datastore.taskBoards.delete(input),
    createPool: (input: CreateTaskPoolInput) => datastore.taskPools.create(input),
    deletePool: (input: DeleteTaskPoolInput) => datastore.taskPools.delete(input),
    setPoolTemplate: (input: SetTaskPoolTemplateInput) => datastore.taskPools.setTemplate(input),
    createTask: (input: CreateTaskInput) => datastore.tasks.create(input),
    delegateTask: (input: DelegateTaskInput) => datastore.tasks.delegate(input),
    undelegateTask: (input: UndelegateTaskInput) => datastore.tasks.undelegate(input),
    renameTask: (input: RenameTaskInput) => datastore.tasks.rename(input),
    setTaskStatus: (input: SetTaskStatusInput) => datastore.tasks.setStatus(input),
    updateTaskDescription: (input: UpdateTaskDescriptionInput) => datastore.tasks.updateDescription(input),
    deleteTask: (input: DeleteTaskInput) => datastore.tasks.delete(input),
    createDependency: (input: CreateTaskDependencyInput) => datastore.taskDependencies.create(input),
    deleteDependency: (input: DeleteTaskDependencyInput) => datastore.taskDependencies.delete(input),
    createTaskDeliverable: (input: CreateTaskDeliverableInput) => datastore.taskDeliverables.create(input),
  };
}
