import type { CreateTaskDependencyInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function createTaskDependencyOperation(ctx: RealtimeOperationContext) {
  return async function createTaskDependency(payload: CreateTaskDependencyInput) {
    return ctx.datastore.emit('createTaskDependency', payload);
  };
}
