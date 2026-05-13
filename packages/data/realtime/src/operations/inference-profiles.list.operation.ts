import type { RealtimeOperationContext } from '../types';

export function listInferenceProfilesOperation(ctx: RealtimeOperationContext) {
  return async function listInferenceProfiles() {
    if (ctx.datastore.state.inferenceProfiles.status === 'loading') {
      return;
    }

    ctx.datastore.patch({ inferenceProfiles: ctx.datastore.state.inferenceProfiles.withStatus('loading') });
    try {
      const result = await ctx.datastore.emit('listInferenceProfiles', { limit: 50, offset: 0 });
      ctx.datastore.patch({ inferenceProfiles: ctx.datastore.state.inferenceProfiles.withReadyItems(result.items) });
    } catch (error) {
      ctx.datastore.patch({ inferenceProfiles: ctx.datastore.state.inferenceProfiles.withStatus('error') });
      throw error;
    }
  };
}
