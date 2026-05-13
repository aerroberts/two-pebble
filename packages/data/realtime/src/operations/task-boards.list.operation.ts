import type { RealtimeOperationContext } from '../types';

export function listTaskBoardsOperation(ctx: RealtimeOperationContext) {
  return async function listTaskBoards() {
    if (ctx.datastore.state.taskBoards.status === 'loading') return;
    ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listTaskBoards', {});
      ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withStatus('error') });
      throw error;
    }
  };
}
