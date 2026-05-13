import type { CreateTaskPoolInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function createTaskPoolOperation(ctx: RealtimeOperationContext) {
  return async function createTaskPool(payload: CreateTaskPoolInput) {
    return ctx.datastore.emit('createTaskPool', payload);
  };
}
