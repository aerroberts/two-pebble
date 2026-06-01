import type { RealtimeOperationContext } from '../types';

export function listTaskBoardsOperation(ctx: RealtimeOperationContext) {
  // De-duplicate concurrent fetches per scope, not on the shared collection
  // status. A global `status === 'loading'` guard made a fetch for one project
  // block a near-simultaneous fetch for a different project, which then never
  // loaded — leaving that project's board list permanently empty (#139).
  const inFlight = new Set<string>();
  return async function listTaskBoards(input: { projectId?: string } = {}) {
    const scopeKey = input.projectId ?? '';
    if (inFlight.has(scopeKey)) {
      return;
    }
    inFlight.add(scopeKey);
    ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listTaskBoards', { projectId: input.projectId });
      // Merge by id so a per-project fetch does not clobber boards owned by
      // another project sharing this registry.
      ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withMergedReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withStatus('error') });
      throw error;
    } finally {
      inFlight.delete(scopeKey);
    }
  };
}
