import type { RealtimeOperationContext } from '../types';

export function updateAutomationOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('updateAutomation');
}
