import type { RealtimeOperationContext } from '../types';

export function updateInferenceProfileOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('updateInferenceProfile');
}
