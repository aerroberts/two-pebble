import type { RealtimeOperationContext } from '../types';

export function listWorkspacesOperation(ctx: RealtimeOperationContext) {
  return async function listWorkspaces() {
    if (ctx.datastore.state.workspaces.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ workspaces: ctx.datastore.state.workspaces.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listWorkspaces', { limit: 50, offset: 0 });
      ctx.datastore.patch({ workspaces: ctx.datastore.state.workspaces.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ workspaces: ctx.datastore.state.workspaces.withStatus('error') });
      throw error;
    }
  };
}
