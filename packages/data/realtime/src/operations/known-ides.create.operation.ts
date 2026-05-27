import type { CreateKnownIdeInput } from '../states/known-ides/types';
import type { RealtimeOperationContext } from '../types';

export function createKnownIdeOperation(ctx: RealtimeOperationContext) {
  return async function createKnownIde(payload: CreateKnownIdeInput) {
    return ctx.datastore.emit('createKnownIde', payload);
  };
}
