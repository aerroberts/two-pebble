import type { RealtimeOperationContext } from '../types';

export function deleteInferenceProfileOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmitLifecycle('deleteInferenceProfile', {
    before(payload) {
      const inferenceProfile = ctx.datastore.state.inferenceProfiles.getItem(payload.id)?.value;
      if (inferenceProfile === undefined || inferenceProfile === null) {
        return;
      }

      ctx.datastore.patch({
        inferenceProfiles: ctx.datastore.state.inferenceProfiles.withItem(payload.id, inferenceProfile, 'loading'),
      });
    },
    error(payload) {
      const inferenceProfile = ctx.datastore.state.inferenceProfiles.getItem(payload.id)?.value;
      if (inferenceProfile === undefined || inferenceProfile === null) {
        return;
      }

      ctx.datastore.patch({
        inferenceProfiles: ctx.datastore.state.inferenceProfiles.withItem(payload.id, inferenceProfile, 'ready'),
      });
    },
  });
}
