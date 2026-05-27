import type { RealtimeOperationContext } from '../types';

export function listProjectsOperation(ctx: RealtimeOperationContext) {
  return async function listProjects() {
    if (ctx.datastore.state.projects.status === 'loading') {
      return;
    }
    ctx.datastore.patch({ projects: ctx.datastore.state.projects.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listProjects', {});
      ctx.datastore.patch({ projects: ctx.datastore.state.projects.withReadyItems(result.items) });
      return result;
    } catch (error) {
      ctx.datastore.patch({ projects: ctx.datastore.state.projects.withStatus('error') });
      throw error;
    }
  };
}
