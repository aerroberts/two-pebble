import type { RealtimeOperationContext } from '../types';

export function listTaskBoardsOperation(ctx: RealtimeOperationContext) {
  return async function listTaskBoards(input: { projectId?: string } = {}) {
    if (ctx.datastore.state.taskBoards.status === 'loading') {
      return;
    }
    ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listTaskBoards', { projectId: input.projectId });
      ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withStatus('error') });
      throw error;
    }
  };
}
