import type { UpdateTaskBoardInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function updateTaskBoardOperation(ctx: RealtimeOperationContext) {
  return async function updateTaskBoard(payload: UpdateTaskBoardInput) {
    return ctx.datastore.emit('updateTaskBoard', payload);
  };
}
