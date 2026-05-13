import type { DeleteTaskDependencyInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function deleteTaskDependencyOperation(ctx: RealtimeOperationContext) {
  return async function deleteTaskDependency(payload: DeleteTaskDependencyInput) {
    return ctx.datastore.emit('deleteTaskDependency', payload);
  };
}
