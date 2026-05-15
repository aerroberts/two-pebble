import type { RealtimeOperationContext } from '../types';

export function deleteAutomationOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('deleteAutomation');
}
