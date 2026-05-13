import type { RealtimeOperationContext } from '../types';

export function deleteAgentRegistryOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmitLifecycle('deleteAgentRegistry', {
    before: (payload) => {
      const registry = ctx.datastore.state.agentRegistries.getItem(payload.id)?.value;
      if (registry === undefined || registry === null) {
        return;
      }

      ctx.datastore.patch({
        agentRegistries: ctx.datastore.state.agentRegistries.withItem(payload.id, registry, 'loading'),
      });
    },
    error: (payload) => {
      const registry = ctx.datastore.state.agentRegistries.getItem(payload.id)?.value;
      if (registry === undefined || registry === null) {
        return;
      }

      ctx.datastore.patch({
        agentRegistries: ctx.datastore.state.agentRegistries.withItem(payload.id, registry, 'ready'),
      });
    },
  });
}
