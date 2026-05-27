import type { RealtimeOperationContext } from '../types';

export function detectIdesOperation(ctx: RealtimeOperationContext) {
  return async function detectIdes() {
    return ctx.datastore.emit('detectIdes', {});
  };
}
