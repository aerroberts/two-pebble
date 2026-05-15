import type { RealtimeOperationContext } from '../types';

export function runAutomationNowOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmit('runAutomationNow');
}
