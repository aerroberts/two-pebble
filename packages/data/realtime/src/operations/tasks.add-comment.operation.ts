import type { AddTaskCommentInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function addTaskCommentOperation(ctx: RealtimeOperationContext) {
  return async function addTaskComment(payload: AddTaskCommentInput) {
    return ctx.datastore.emit('addTaskComment', payload);
  };
}
