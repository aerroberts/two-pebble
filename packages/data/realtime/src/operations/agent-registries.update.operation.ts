import type { RealtimeOperationContext } from '../types';

export function updateAgentRegistryOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('updateAgentRegistry');
}
