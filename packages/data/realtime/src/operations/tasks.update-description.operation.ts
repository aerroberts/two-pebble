import type { UpdateTaskDescriptionInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function updateTaskDescriptionOperation(ctx: RealtimeOperationContext) {
  return async function updateTaskDescription(payload: UpdateTaskDescriptionInput) {
    return ctx.datastore.emit('updateTaskDescription', payload);
  };
}
