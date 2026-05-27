import type { RealtimeOperationContext } from '../types';

export function deleteKnownIdeOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmitLifecycle('deleteKnownIde', {
    before: (payload) => {
      const knownIde = ctx.datastore.state.knownIdes.getItem(payload.id)?.value;
      if (knownIde === undefined || knownIde === null) {
        return;
      }

      ctx.datastore.patch({
        knownIdes: ctx.datastore.state.knownIdes.withItem(payload.id, knownIde, 'loading'),
      });
    },
    error: (payload) => {
      const knownIde = ctx.datastore.state.knownIdes.getItem(payload.id)?.value;
      if (knownIde === undefined || knownIde === null) {
        return;
      }

      ctx.datastore.patch({
        knownIdes: ctx.datastore.state.knownIdes.withItem(payload.id, knownIde, 'ready'),
      });
    },
  });
}
