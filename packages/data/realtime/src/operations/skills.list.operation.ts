import type { RealtimeOperationContext } from '../types';

export function listSkillsOperation(ctx: RealtimeOperationContext) {
  return async function listSkills(payload: { limit?: number; offset?: number; projectId?: string } = {}) {
    if (ctx.datastore.state.skills.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ skills: ctx.datastore.state.skills.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listSkills', {
        limit: payload.limit ?? 200,
        offset: payload.offset ?? 0,
        projectId: payload.projectId,
      });
      ctx.datastore.patch({ skills: ctx.datastore.state.skills.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ skills: ctx.datastore.state.skills.withStatus('error') });
      throw error;
    }
  };
}
