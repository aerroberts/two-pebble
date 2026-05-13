import type { UndelegateTaskInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function undelegateTaskOperation(ctx: RealtimeOperationContext) {
  return async function undelegateTask(payload: UndelegateTaskInput) {
    return ctx.datastore.emit('undelegateTask', payload);
  };
}
