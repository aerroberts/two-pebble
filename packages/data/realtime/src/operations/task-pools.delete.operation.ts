import type { DeleteTaskPoolInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function deleteTaskPoolOperation(ctx: RealtimeOperationContext) {
  return async function deleteTaskPool(payload: DeleteTaskPoolInput) {
    return ctx.datastore.emit('deleteTaskPool', payload);
  };
}
