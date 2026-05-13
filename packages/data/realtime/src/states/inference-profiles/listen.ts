import type { RealtimeOperationContext } from '../../types';

export function listenToInferenceProfiles(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('inferenceProfileDeleted', (deleted) => {
    ctx.datastore.patch({ inferenceProfiles: ctx.datastore.state.inferenceProfiles.withoutItem(deleted.id) });
  });
  client.listen('inferenceProfileUpdated', (inferenceProfile) => {
    ctx.datastore.patch({
      inferenceProfiles: ctx.datastore.state.inferenceProfiles.withItem(inferenceProfile.id, inferenceProfile, 'ready'),
    });
  });
}
