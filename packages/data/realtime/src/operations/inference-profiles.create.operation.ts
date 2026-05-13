import type { CreateInferenceProfileInput } from '../states/inference-profiles/types';
import type { RealtimeOperationContext } from '../types';

export function createInferenceProfileOperation(ctx: RealtimeOperationContext) {
  return async function createInferenceProfile(payload: CreateInferenceProfileInput) {
    return ctx.datastore.emit('createInferenceProfile', payload);
  };
}
