import type { CreateTaskBoardInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function createTaskBoardOperation(ctx: RealtimeOperationContext) {
  return async function createTaskBoard(payload: CreateTaskBoardInput) {
    return ctx.datastore.emit('createTaskBoard', payload);
  };
}
