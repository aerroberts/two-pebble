import type { DeleteTaskInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function deleteTaskOperation(ctx: RealtimeOperationContext) {
  return async function deleteTask(payload: DeleteTaskInput) {
    return ctx.datastore.emit('deleteTask', payload);
  };
}
