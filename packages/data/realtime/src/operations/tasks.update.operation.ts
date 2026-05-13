import type { SetTaskStatusInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function setTaskStatusOperation(ctx: RealtimeOperationContext) {
  return async function setTaskStatus(payload: SetTaskStatusInput) {
    return ctx.datastore.emit('setTaskStatus', payload);
  };
}
