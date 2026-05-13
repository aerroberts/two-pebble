import type { DeleteTaskBoardInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function deleteTaskBoardOperation(ctx: RealtimeOperationContext) {
  return async function deleteTaskBoard(payload: DeleteTaskBoardInput) {
    return ctx.datastore.emit('deleteTaskBoard', payload);
  };
}
