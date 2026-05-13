import type { RealtimeOperationContext } from '../types';

export function deleteIntegrationOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmitLifecycle('deleteIntegration', {
    before: (payload) => {
      const integration = ctx.datastore.state.integrations.getItem(payload.id)?.value;
      if (integration === undefined || integration === null) {
        return;
      }

      ctx.datastore.patch({
        integrations: ctx.datastore.state.integrations.withItem(payload.id, integration, 'loading'),
      });
    },
    error: (payload) => {
      const integration = ctx.datastore.state.integrations.getItem(payload.id)?.value;
      if (integration === undefined || integration === null) {
        return;
      }

      ctx.datastore.patch({
        integrations: ctx.datastore.state.integrations.withItem(payload.id, integration, 'ready'),
      });
    },
  });
}
