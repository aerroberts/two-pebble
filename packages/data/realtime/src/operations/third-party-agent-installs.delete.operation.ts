import type { RealtimeOperationContext } from '../types';

export function deleteThirdPartyAgentInstallOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmitLifecycle('deleteThirdPartyAgentInstall', {
    before: (payload) => {
      const install = ctx.datastore.state.thirdPartyAgentInstalls.getItem(payload.id)?.value;
      if (install === undefined || install === null) {
        return;
      }

      ctx.datastore.patch({
        thirdPartyAgentInstalls: ctx.datastore.state.thirdPartyAgentInstalls.withItem(payload.id, install, 'loading'),
      });
    },
    error: (payload) => {
      const install = ctx.datastore.state.thirdPartyAgentInstalls.getItem(payload.id)?.value;
      if (install === undefined || install === null) {
        return;
      }

      ctx.datastore.patch({
        thirdPartyAgentInstalls: ctx.datastore.state.thirdPartyAgentInstalls.withItem(payload.id, install, 'ready'),
      });
    },
  });
}
