import type { RenameTaskInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function renameTaskOperation(ctx: RealtimeOperationContext) {
  return async function renameTask(payload: RenameTaskInput) {
    return ctx.datastore.emit('renameTask', payload);
  };
}
