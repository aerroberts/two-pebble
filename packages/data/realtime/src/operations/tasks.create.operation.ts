import type { CreateTaskInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function createTaskOperation(ctx: RealtimeOperationContext) {
  return async function createTask(payload: CreateTaskInput) {
    return ctx.datastore.emit('createTask', payload);
  };
}
