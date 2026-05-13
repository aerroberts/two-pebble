import type { DelegateTaskInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function delegateTaskOperation(ctx: RealtimeOperationContext) {
  return async function delegateTask(payload: DelegateTaskInput) {
    return ctx.datastore.emit('delegateTask', payload);
  };
}
